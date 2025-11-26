import { FormEvent, useMemo, useState, useEffect } from 'react'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'
import { CustomerProfile, Order } from '../types'
import './CheckoutPage.css'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initialProfile: CustomerProfile = {
  messId: '',
  name: '',
  rollNumber: '',
  contact: ''
}

export const CheckoutPage = () => {
  const { cart, loading, clearCart, refreshCart, removeItem } = useCart()
  const { user } = useAuth()
  const computedTotal = useMemo(() => {
    if (!cart?.cartItems) return 0
    return cart.cartItems.reduce((sum, item) => sum + item.foodItem.unitPrice * item.quantity, 0)
  }, [cart])
  const [customer, setCustomer] = useState(initialProfile)
  const [instructions, setInstructions] = useState('')
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<Order>()
  const [error, setError] = useState<string>()

  const defaultCustomer = useMemo<CustomerProfile>(() => ({
    messId: user?.profile?.messId || user?.identifier || '',
    name: user?.name || '',
    rollNumber: user?.profile?.rollNumber || '',
    contact: user?.profile?.contact || ''
  }), [user])

  useEffect(() => {
    if (user?.role === 'student') {
      setCustomer(defaultCustomer)
    }
  }, [user, defaultCustomer])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!cart || !cart.cartItems?.length) {
      setError('Add at least one item to cart.')
      return
    }
    if (!user || user.role !== 'student') {
      setError('Please login as a student to place orders.')
      return
    }
    try {
      setSaving(true)
      const payload = {
        customer,
        specialInstructions: instructions
      }
      const placed = await api.createOrder(payload)
      setOrder(placed as Order)
      await clearCart()
      await refreshCart()
      setCustomer(defaultCustomer)
      setInstructions('')
      setError(undefined)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (!user || user.role !== 'student') {
    return (
      <div className="checkout">
        <section className="checkout-form">
          <h2>Student login required</h2>
          <p>Please log in with your Mess ID to place an order.</p>
          <Link to="/login" className="cta ghost small">Go to login</Link>
        </section>
      </div>
    )
  }

  return (
    <div className="checkout">
      <section className="cart-panel">
        <header>
          <h2>Cart overview</h2>
          <p>{cart?.cartItems?.length || 0} items</p>
        </header>

        {loading && <p className="muted">Loading cart…</p>}
        {!loading && (!cart || !cart.cartItems?.length) && (
          <div className="empty">
            <p>Your cart is empty.</p>
            <Link to="/menu" className="cta ghost small">Browse menu</Link>
          </div>
        )}

        <ul>
          {cart?.cartItems?.map(item => (
            <li key={item._id}>
              <div>
                <h4>{item.foodItem.name}</h4>
                <p>{item.foodItem.description}</p>
              </div>
              <div className="line-amount">
                <span>×{item.quantity}</span>
                <strong>₹{item.foodItem.unitPrice * item.quantity}</strong>
                <button type="button" onClick={() => removeItem(item._id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="cart-total">
          <span>Total</span>
          <strong>₹{computedTotal}</strong>
        </div>
      </section>

      <section className="checkout-form">
        <h2>Digital queue ticket</h2>
        <p>Provide your Mess ID profile so we can bind the ticket to you.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Mess ID
              <input
                required
                value={customer.messId}
                onChange={(e) => setCustomer({ ...customer, messId: e.target.value })}
              />
            </label>
            <label>
              Full name
              <input
                required
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
            </label>
            <label>
              Roll number
              <input
                required
                value={customer.rollNumber}
                onChange={(e) => setCustomer({ ...customer, rollNumber: e.target.value })}
              />
            </label>
            <label>
              Contact (optional)
              <input
                value={customer.contact}
                onChange={(e) => setCustomer({ ...customer, contact: e.target.value })}
              />
            </label>
          </div>

          <label>
            Special instructions
            <textarea
              placeholder="Less oil, extra sambhar, etc."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={saving}>
            {saving ? 'Placing order…' : 'Generate ticket'}
          </button>
        </form>

        {order && (
          <div className="ticket">
            <p className="eyebrow">Ticket generated</p>
            <h3>{order.ticketId}</h3>
            <p>Queue number <strong>{order.queueNumber}</strong> • Status {order.status}</p>
            <p>
              Estimated pickup:{' '}
              {order.estimatedPickup ? new Date(order.estimatedPickup).toLocaleTimeString() : 'Soon'}
            </p>
            <Link to={`/track?ticket=${order.ticketId}`} className="cta ghost small">
              Track ticket
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}


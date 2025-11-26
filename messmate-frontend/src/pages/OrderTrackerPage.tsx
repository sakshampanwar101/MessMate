import { FormEvent, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { Order } from '../types'
import './OrderTrackerPage.css'
import { useAuth } from '../context/AuthContext'

export const OrderTrackerPage = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [ticketId, setTicketId] = useState(searchParams.get('ticket') ?? '')
  const [order, setOrder] = useState<Order>()
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const fetchTicket = async (id: string) => {
    try {
      setLoading(true)
      const data = await api.trackOrder(id)
      setOrder(data as Order)
      setError(undefined)
      setSearchParams({ ticket: id })
    } catch (err) {
      setOrder(undefined)
      setError((err as Error).message || 'Ticket not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ticketId) {
      fetchTicket(ticketId)
    }
    if (user?.role === 'student') {
      api.getMyOrders().then(result => {
        setMyOrders(result as Order[])
      }).catch(() => setMyOrders([]))
    } else {
      setMyOrders([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!ticketId) {
      setError('Enter a ticket ID')
      return
    }
    fetchTicket(ticketId)
  }

  return (
    <div className="tracker">
      <section className="tracker-card">
        <h2>Track ticket</h2>
        <p>Enter the alphanumeric code printed on your MessMate ticket.</p>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="MM-20251124-007-42"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'View status'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      {order && (
        <section className="tracker-result">
          <div className="ticket-header">
            <div>
              <p className="eyebrow">Ticket ID</p>
              <h3>{order.ticketId}</h3>
            </div>
            <div>
              <p className="eyebrow">Queue #</p>
              <h3>{order.queueNumber}</h3>
            </div>
            <div>
              <p className="eyebrow">Status</p>
              <h3>{order.status}</h3>
            </div>
          </div>

          <div className="timeline">
            {order.statusHistory?.map(history => (
              <article key={history.changedAt} className="timeline-row">
                <div>
                  <span className="status">{history.status}</span>
                  <p>{history.note || 'Status updated'}</p>
                </div>
                <time>{new Date(history.changedAt).toLocaleTimeString()}</time>
              </article>
            ))}
          </div>
        </section>
      )}

      {user?.role === 'student' && (
        <section className="tracker-history">
          <h3>Your recent tickets</h3>
          {myOrders.length === 0 && <p className="muted">Place an order to see it here.</p>}
          <ul>
            {myOrders.map(item => (
              <li key={item._id}>
                <div>
                  <strong>{item.ticketId}</strong>
                  <span>Queue #{item.queueNumber}</span>
                </div>
                <div>
                  <span>{item.status}</span>
                  <button onClick={() => fetchTicket(item.ticketId)}>View</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}


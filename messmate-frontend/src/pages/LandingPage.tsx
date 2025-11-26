import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { FoodItem } from '../types'
import './LandingPage.css'

const highlights = [
  {
    title: 'Digital Queue Tickets',
    body: 'Orders generate Mess IDs, ticket IDs, and live queue numbers so students know exactly when to pick up their meal.'
  },
  {
    title: 'Live Kitchen Console',
    body: 'Staff work through FIFO queues, update statuses, and broadcast pickup notifications without shouting across the counter.'
  },
  {
    title: 'Menu Intelligence',
    body: 'Admins curate daily and special menus, toggle availability windows, and mark items as sold-out in one tap.'
  }
]

export const LandingPage = () => {
  const [specials, setSpecials] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        const data = await api.getFoodItems({ special: 'true', available: 'true' })
        setSpecials((data as FoodItem[]).slice(0, 4))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSpecials()
  }, [])

  return (
    <div className="landing">
      <section className="hero">
        <p className="badge">TIET · Digital Queue Management</p>
        <h1>MessMate keeps your canteen calm, fair, and predictable.</h1>
        <p className="subtitle">
          Students place orders, receive a virtual ticket, and get pinged the moment the kitchen marks their meal ready.
          Staff focus on cooking, not crowd control.
        </p>
        <div className="hero-actions">
          <Link to="/menu" className="cta primary">Browse menu</Link>
          <Link to="/track" className="cta ghost">Track ticket</Link>
        </div>
        <div className="hero-metrics">
          <div>
            <span className="metric">~5 min</span>
            <span className="label">Average pickup ETA</span>
          </div>
          <div>
            <span className="metric">100%</span>
            <span className="label">FIFO order integrity</span>
          </div>
          <div>
            <span className="metric">24x7</span>
            <span className="label">Queue visibility</span>
          </div>
        </div>
      </section>

      <section className="highlights">
        {highlights.map(card => (
          <article key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </section>

      <section className="specials">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Chef specials</p>
            <h2>Highlighted items</h2>
          </div>
          <Link to="/menu" className="cta ghost small">View full menu</Link>
        </div>

        {loading && <p className="muted">Fetching today&apos;s highlights…</p>}
        {!loading && specials.length === 0 && (
          <p className="muted">No active specials at the moment. Check back later!</p>
        )}

        <div className="special-grid">
          {specials.map(item => (
            <article key={item._id} className="special-card">
              <div className="card-body">
                <span className="tag">{item.category}</span>
                <h3>{item.name}</h3>
                <p>{item.description || 'Seasonal favourite curated by the MessMate team.'}</p>
              </div>
              <div className="card-footer">
                <span className="price">₹{item.unitPrice}</span>
                <span className="window">
                  {item.pickupWindow?.start ? `${item.pickupWindow.start} - ${item.pickupWindow.end}` : 'All day'}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}


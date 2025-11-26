import { FormEvent, useState } from 'react'
import useSWR from 'swr'
import { api } from '../api/client'
import { Order, OrderStatus } from '../types'
import './QueueDashboardPage.css'

const nextSteps: Record<OrderStatus, OrderStatus[]> = {
  Queued: ['Preparing', 'Cancelled'],
  Preparing: ['Ready', 'Cancelled'],
  Ready: ['Collected', 'Cancelled'],
  Collected: [],
  Cancelled: []
}

export const QueueDashboardPage = () => {
  const [ticketId, setTicketId] = useState('')
  const [ticketOrder, setTicketOrder] = useState<Order>()
  const [ticketMessage, setTicketMessage] = useState<string>()
  const { data, isLoading, mutate } = useSWR<Order[]>('/queue?status=Queued,Preparing,Ready', async () => {
    const queue = await api.getQueue('Queued,Preparing,Ready')
    return queue as Order[]
  }, { refreshInterval: 8000 })

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    await api.updateOrderStatus(orderId, status, `Marked ${status} via dashboard`)
    mutate()
    setTicketOrder(prev => prev && prev._id === orderId ? { ...prev, status } : prev)
  }

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault()
    if (!ticketId) {
      setTicketMessage('Enter a ticket ID')
      return
    }
    try {
      const info = await api.trackOrder(ticketId)
      setTicketOrder(info as Order)
      setTicketMessage(undefined)
    } catch (err) {
      setTicketOrder(undefined)
      setTicketMessage((err as Error).message || 'Ticket not found')
    }
  }

  return (
    <div className="queue">
      <header className="queue-head">
        <div>
          <p className="eyebrow">Kitchen console</p>
          <h2>Orders in progress</h2>
        </div>
        <button onClick={() => mutate()}>Refresh now</button>
      </header>

      <section className="ticket-verify">
        <div>
          <h3>Verify ticket</h3>
          <p>Scan or type the ticket code to view details and mark ready/collected.</p>
        </div>
        <form onSubmit={handleVerify}>
          <input
            value={ticketId}
            placeholder="MM-20251124-007-42"
            onChange={(e) => setTicketId(e.target.value)}
          />
          <button type="submit">Lookup</button>
        </form>
        {ticketMessage && <p className="error">{ticketMessage}</p>}
        {ticketOrder && (
          <div className="ticket-result">
            <div>
              <h4>{ticketOrder.ticketId}</h4>
              <p>Queue #{ticketOrder.queueNumber} · {ticketOrder.status}</p>
            </div>
            <div className="actions">
              {nextSteps[ticketOrder.status].map(next => (
                <button key={next} onClick={() => updateStatus(ticketOrder._id, next)}>
                  {next}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {isLoading && <p className="muted">Gathering queue data…</p>}

      <section className="queue-list">
        {data?.map(order => (
          <article key={order._id} className="queue-card">
            <header>
              <div>
                <p className="eyebrow">Ticket</p>
                <h3>{order.ticketId}</h3>
              </div>
              <div className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</div>
            </header>
            <div className="details">
              <p><strong>Student:</strong> {order.customer.name} ({order.customer.messId})</p>
              <p><strong>Queue #{order.queueNumber}</strong></p>
              <ul>
                {order.orderItems.map((item, idx) => (
                  <li key={`${item.food}-${idx}`}>{item.food} × {item.quantity}</li>
                ))}
              </ul>
            </div>
            <div className="actions">
              {nextSteps[order.status].map(next => (
                <button key={next} onClick={() => updateStatus(order._id, next)}>
                  {next}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      {!isLoading && data?.length === 0 && (
        <p className="muted">No active orders in the queue. 🎉</p>
      )}
    </div>
  )
}


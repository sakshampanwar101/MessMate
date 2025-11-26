import { FormEvent, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'
import { FoodItem } from '../types'
import './MenuPage.css'

const categoryLabel = (raw: string) =>
  raw.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export const MenuPage = () => {
  const [items, setItems] = useState<FoodItem[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [toast, setToast] = useState<string>()
  const { addItem } = useCart()

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const data = await api.getFoodItems()
        setItems(data as FoodItem[])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const categories = useMemo(() => {
    const all = Array.from(new Set(items.map(item => item.category)))
    return ['all', ...all]
  }, [items])

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || item.category === category
      return matchesSearch && matchesCategory && (item.available ?? true)
    })
  }, [items, search, category])

  const handleAdd = async (foodId: string, evt?: FormEvent<HTMLButtonElement>) => {
    evt?.preventDefault()
    try {
      await addItem(foodId, 1)
      setToast('Added to cart')
      setTimeout(() => setToast(undefined), 2000)
    } catch (err) {
      setToast((err as Error).message)
    }
  }

  return (
    <div className="menu-page">
      <section className="menu-hero">
        <div>
          <p className="eyebrow">Live menu board</p>
          <h1>Pick your meal, skip the chaos.</h1>
          <p>Every add-to-cart call reserves your slot in the kitchen queue.</p>
        </div>
        <input
          type="search"
          placeholder="Search dosa, sandwich, smoothie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <div className="filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={cat === category ? 'chip active' : 'chip'}
            onClick={() => setCategory(cat)}
          >
            {categoryLabel(cat)}
          </button>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
      {error && <div className="error">{error}</div>}
      {loading && <p className="muted">Loading menu…</p>}

      <section className="menu-grid">
        {filtered.map(item => (
          <article key={item._id} className="menu-card">
            {item.isSpecial && <span className="special-flag">Special</span>}
            <h3>{item.name}</h3>
            <p>{item.description || 'No description provided.'}</p>
            <div className="meta">
              <span>₹{item.unitPrice}</span>
              <span>{categoryLabel(item.category)}</span>
            </div>
            <div className="card-actions">
              <button onClick={(evt) => handleAdd(item._id, evt)}>Add to cart</button>
              {item.pickupWindow?.start && (
                <span className="window">{item.pickupWindow.start} - {item.pickupWindow.end}</span>
              )}
            </div>
          </article>
        ))}
      </section>

      {!loading && filtered.length === 0 && (
        <p className="muted">No menu items match your filters.</p>
      )}
    </div>
  )
}


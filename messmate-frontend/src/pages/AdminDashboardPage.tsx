import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api/client'
import { FoodItem, UserAccount, Order } from '../types'
import './AdminDashboardPage.css'

type MenuForm = {
  name: string
  description: string
  unitPrice: string
  category: string
  isSpecial: boolean
  pickupStart?: string
  pickupEnd?: string
}

type UserForm = {
  identifier: string
  name: string
  password: string
  role: 'student' | 'staff' | 'admin'
}

type OrderReport = {
  summary: Record<string, number>
  orders: Order[]
}

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'users' | 'reports'>('menu')
  const [menuItems, setMenuItems] = useState<FoodItem[]>([])
  const [users, setUsers] = useState<UserAccount[]>([])
  const [report, setReport] = useState<OrderReport | null>(null)
  const [menuForm, setMenuForm] = useState<MenuForm>({
    name: '',
    description: '',
    unitPrice: '',
    category: '',
    isSpecial: false,
    pickupStart: '',
    pickupEnd: ''
  })
  const [userForm, setUserForm] = useState<UserForm>({
    identifier: '',
    name: '',
    password: '',
    role: 'staff'
  })
  const [message, setMessage] = useState<string>()

  const loadMenus = async() => {
    const data = await api.getFoodItems()
    setMenuItems(data as FoodItem[])
  }

  const loadUsers = async() => {
    const data = await api.getUsers()
    setUsers(data as UserAccount[])
  }

  const loadReport = async() => {
    const data = await api.getOrderReport()
    setReport(data as OrderReport)
  }

  useEffect(() => {
    loadMenus()
    loadUsers()
    loadReport()
  }, [])

  const handleMenuSubmit = async(event: FormEvent) => {
    event.preventDefault()
    try {
      await api.createFoodItem({
        name: menuForm.name,
        description: menuForm.description,
        unitPrice: Number(menuForm.unitPrice),
        category: menuForm.category,
        isSpecial: menuForm.isSpecial,
        pickupWindow: menuForm.pickupStart && menuForm.pickupEnd ? {
          start: menuForm.pickupStart,
          end: menuForm.pickupEnd
        } : undefined
      })
      setMessage('Menu item added.')
      setMenuForm({
        name: '',
        description: '',
        unitPrice: '',
        category: '',
        isSpecial: false,
        pickupStart: '',
        pickupEnd: ''
      })
      loadMenus()
    } catch (err) {
      setMessage((err as Error).message)
    }
  }

  const handleUserSubmit = async(event: FormEvent) => {
    event.preventDefault()
    try {
      await api.createUser({
        identifier: userForm.identifier,
        name: userForm.name,
        password: userForm.password,
        role: userForm.role
      })
      setMessage('User created.')
      setUserForm({
        identifier: '',
        name: '',
        password: '',
        role: 'staff'
      })
      loadUsers()
    } catch (err) {
      setMessage((err as Error).message)
    }
  }

  const removeUser = async(id: string) => {
    await api.deleteUser(id)
    loadUsers()
  }

  return (
    <div className="admin-panel">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Administrator</p>
          <h2>Control centre</h2>
        </div>
        <div className="tabs">
          <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>
            Menu & Items
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            Users
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => { setActiveTab('reports'); loadReport() }}>
            Reports
          </button>
        </div>
      </header>

      {message && <p className="info">{message}</p>}

      {activeTab === 'menu' && (
        <section className="admin-grid">
          <form className="card" onSubmit={handleMenuSubmit}>
            <h3>Add menu item</h3>
            <label>Name
              <input value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} required />
            </label>
            <label>Description
              <textarea value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} />
            </label>
            <div className="two-col">
              <label>Price
                <input type="number" value={menuForm.unitPrice} onChange={(e) => setMenuForm({ ...menuForm, unitPrice: e.target.value })} required />
              </label>
              <label>Category
                <input value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })} required />
              </label>
            </div>
            <label className="checkbox">
              <input type="checkbox" checked={menuForm.isSpecial} onChange={(e) => setMenuForm({ ...menuForm, isSpecial: e.target.checked })} />
              Mark as special highlight
            </label>
            <div className="two-col">
              <label>Pickup start
                <input type="time" value={menuForm.pickupStart} onChange={(e) => setMenuForm({ ...menuForm, pickupStart: e.target.value })} />
              </label>
              <label>Pickup end
                <input type="time" value={menuForm.pickupEnd} onChange={(e) => setMenuForm({ ...menuForm, pickupEnd: e.target.value })} />
              </label>
            </div>
            <button type="submit">Save item</button>
          </form>

          <div className="card">
            <h3>Current items</h3>
            <ul className="menu-list">
              {menuItems.map(item => (
                <li key={item._id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.description}</p>
                  </div>
                  <span>₹{item.unitPrice}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {activeTab === 'users' && (
        <section className="admin-grid">
          <form className="card" onSubmit={handleUserSubmit}>
            <h3>Create user</h3>
            <label>Identifier
              <input value={userForm.identifier} onChange={(e) => setUserForm({ ...userForm, identifier: e.target.value })} required />
            </label>
            <label>Name
              <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
            </label>
            <label>Password
              <input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
            </label>
            <label>Role
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserForm['role'] })}>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button type="submit">Create</button>
          </form>

          <div className="card">
            <h3>Users</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Identifier</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.identifier}</td>
                    <td>{user.role}</td>
                    <td><button onClick={() => removeUser(user.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'reports' && report && (
        <section className="card report-card">
          <h3>Order summary</h3>
          <div className="report-grid">
            {Object.entries(report.summary).map(([status, count]) => (
              <div key={status} className="report-chip">
                <span>{status}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
          <h3>Recent orders</h3>
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Student</th>
                <th>Status</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {report.orders.map(order => (
                <tr key={order._id}>
                  <td>{order.ticketId}</td>
                  <td>{order.customer.name}</td>
                  <td>{order.status}</td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}


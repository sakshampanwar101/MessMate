import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Header.css'

const baseNav = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/track', label: 'Track Order' }
]

const studentNav = [
  ...baseNav,
  { to: '/checkout', label: 'Checkout' }
]

const staffNav = [
  { to: '/', label: 'Home' },
  { to: '/queue', label: 'Kitchen Console' }
]

const adminNav = [
  { to: '/', label: 'Home' },
  { to: '/admin', label: 'Admin Panel' },
  { to: '/queue', label: 'Kitchen Console' }
]

export const Header = () => {
  const { itemCount } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = useMemo(() => {
    if (!user) return baseNav
    if (user.role === 'student') return studentNav
    if (user.role === 'staff') return staffNav
    if (user.role === 'admin') return adminNav
    return baseNav
  }, [user])

  const handleLogout = async() => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="mm-header">
      <Link to="/" className="mm-brand">
        MessMate
      </Link>
      <nav className="mm-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => isActive ? 'mm-nav-link active' : 'mm-nav-link'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mm-header-actions">
        {user && user.role === 'student' && (
          <Link to="/checkout" className="mm-cart-pill">
            <span>Cart</span>
            <span className="count">{itemCount}</span>
          </Link>
        )}
        {user ? (
          <div className="mm-user-pill">
            <span className="role">{user.role}</span>
            <span className="name">{user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Link to="/login" className="mm-login-btn">Login</Link>
        )}
      </div>
    </header>
  )
}


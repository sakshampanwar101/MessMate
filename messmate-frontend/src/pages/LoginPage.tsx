import { FormEvent, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

const ROLES: Array<{ key: 'student' | 'staff' | 'admin'; label: string; description: string }> = [
  { key: 'student', label: 'Student', description: 'Mess ID checkout, digital tickets' },
  { key: 'staff', label: 'Kitchen Staff', description: 'Queue console & order prep' },
  { key: 'admin', label: 'Administrator', description: 'Menu, catalog, analytics' }
]

export const LoginPage = () => {
  const { login, registerStudent } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const requiredRole = (location.state as any)?.requiredRole as 'student' | 'staff' | 'admin' | undefined
  const [activeRole, setActiveRole] = useState<'student' | 'staff' | 'admin'>(requiredRole || 'student')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [registerData, setRegisterData] = useState({
    identifier: '',
    name: '',
    password: '',
    rollNumber: '',
    contact: ''
  })
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [message, setMessage] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const redirectTarget = useMemo(() => {
    if (location.state?.from) return location.state.from as string
    return activeRole === 'student' ? '/menu' : '/queue'
  }, [activeRole, location.state])

  const handleLogin = async(event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(undefined)
    try {
      await login({ identifier, password, role: activeRole })
      navigate(redirectTarget, { replace: true })
    } catch (err) {
      setMessage((err as Error).message || 'Unable to login')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async(event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(undefined)
    try {
      await registerStudent(registerData)
      setMessage('Registration successful! Please log in using your Mess ID.')
      setMode('login')
      setIdentifier(registerData.identifier)
    } catch (err) {
      setMessage((err as Error).message || 'Unable to register')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-panel">
        <p className="eyebrow">Secure access</p>
        <h1>Choose your MessMate console</h1>
        <p className="muted">Students, staff, and admins authenticate with purpose-built experiences.</p>

        <div className="role-tabs">
          {ROLES.map(role => (
            <button
              key={role.key}
              className={role.key === activeRole ? 'tab active' : 'tab'}
              onClick={() => {
                setActiveRole(role.key)
                setMode('login')
                setMessage(undefined)
              }}
            >
              <span>{role.label}</span>
              <small>{role.description}</small>
            </button>
          ))}
        </div>

        {activeRole !== 'student' && (
          <div className="info-card">
            <p>
              <strong>{activeRole === 'staff' ? 'Kitchen team' : 'Admins'}</strong> use the credentials provided by the
              MessMate administrator. Seed accounts:
            </p>
            <ul>
              <li>Admin → `admin001` / `Admin@123`</li>
              <li>Staff → `kitchen001` / `Kitchen@123`</li>
            </ul>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <label>
              {activeRole === 'student' ? 'Mess ID' : 'Identifier'}
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={activeRole === 'student' ? 'MM-1023' : `${activeRole} id`}
              />
            </label>
            <label>
              Password
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {message && <p className="error">{message}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
            {activeRole === 'student' && (
              <p className="muted small">
                Need a Mess ID?
                <button type="button" onClick={() => { setMode('register'); setMessage(undefined); }}>
                  Create one
                </button>
              </p>
            )}
          </form>
        )}

        {mode === 'register' && activeRole === 'student' && (
          <form onSubmit={handleRegister} className="auth-form">
            <label>
              Mess ID
              <input
                required
                value={registerData.identifier}
                onChange={(e) => setRegisterData({ ...registerData, identifier: e.target.value })}
                placeholder="MM-"
              />
            </label>
            <label>
              Full name
              <input
                required
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              />
            </label>
            <label>
              Roll number
              <input
                required
                value={registerData.rollNumber}
                onChange={(e) => setRegisterData({ ...registerData, rollNumber: e.target.value })}
              />
            </label>
            <label>
              Contact
              <input
                value={registerData.contact}
                onChange={(e) => setRegisterData({ ...registerData, contact: e.target.value })}
              />
            </label>
            <label>
              Password
              <input
                required
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </label>
            {message && <p className="error">{message}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Mess ID'}
            </button>
            <p className="muted small">
              Already registered?
              <button type="button" onClick={() => { setMode('login'); setMessage(undefined); }}>
                Back to login
              </button>
            </p>
          </form>
        )}
      </section>
    </div>
  )
}


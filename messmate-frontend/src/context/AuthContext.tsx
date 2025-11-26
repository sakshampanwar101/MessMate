import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { AuthUser } from '../types'

type LoginPayload = {
  identifier: string
  password: string
  role?: 'student' | 'staff' | 'admin'
}

type RegisterPayload = {
  identifier: string
  name: string
  password: string
  rollNumber: string
  contact?: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  error?: string
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  registerStudent: (payload: RegisterPayload) => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  registerStudent: async () => {},
  refresh: async () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true)
      const session = await api.session()
      setUser(session as AuthUser | null)
      setError(undefined)
    } catch (err) {
      setError((err as Error).message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const login = useCallback(async(payload: LoginPayload) => {
    const result = await api.login(payload)
    setUser((result as { user: AuthUser }).user)
  }, [])

  const logout = useCallback(async() => {
    await api.logout()
    setUser(null)
  }, [])

  const registerStudent = useCallback(async(payload: RegisterPayload) => {
    await api.registerStudent(payload)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    login,
    logout,
    registerStudent,
    refresh: fetchSession
  }), [user, loading, error, login, logout, registerStudent, fetchSession])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


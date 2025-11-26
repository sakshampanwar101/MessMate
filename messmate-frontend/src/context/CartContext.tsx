import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { Cart } from '../types'
import { useAuth } from './AuthContext'

type CartContextValue = {
  cart: Cart | null
  loading: boolean
  error?: string
  refreshCart: () => Promise<void>
  addItem: (foodId: string, quantity?: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: number
}

const CartContext = createContext<CartContextValue>({
  cart: null,
  loading: true,
  refreshCart: async () => {},
  addItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  itemCount: 0
})

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const { user } = useAuth()

  const refreshCart = useCallback(async () => {
    if (!user || user.role !== 'student') {
      setCart(null)
      setLoading(false)
      setError(undefined)
      return
    }
    try {
      setLoading(true)
      const data = await api.getCart()
      setCart((data as Cart) || null)
      setError(undefined)
    } catch (err) {
      setError((err as Error).message)
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshCart()
  }, [refreshCart, user])

  const addItem = useCallback(async (foodId: string, quantity = 1) => {
    await api.addToCart(foodId, quantity)
    await refreshCart()
  }, [refreshCart])

  const removeItem = useCallback(async (cartItemId: string) => {
    await api.removeCartItem(cartItemId)
    await refreshCart()
  }, [refreshCart])

  const clearCart = useCallback(async () => {
    await api.clearCart()
    setCart(null)
  }, [])

  const value = useMemo<CartContextValue>(() => ({
    cart,
    loading,
    error,
    refreshCart,
    addItem,
    removeItem,
    clearCart,
    itemCount: cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0
  }), [cart, loading, error, refreshCart, addItem, removeItem, clearCart])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)


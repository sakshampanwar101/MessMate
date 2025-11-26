const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

const defaultHeaders = {
  'Content-Type': 'application/json'
}

const buildUrl = (path: string) => {
  if (path.startsWith('http')) return path
  return `${API_BASE_URL}${path}`
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    },
    ...options
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || response.statusText)
  }

  if (response.status === 204) {
    return null as T
  }

  const payload = await response.text()
  if (!payload) {
    return null as T
  }

  return JSON.parse(payload) as T
}

export const api = {
  session: () => apiFetch('/auth/me'),
  login: (body: { identifier: string; password: string; role?: string }) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  logout: () =>
    apiFetch('/auth/logout', {
      method: 'POST'
    }),
  registerStudent: (body: { identifier: string; name: string; password: string; rollNumber: string; contact?: string }) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        role: 'student',
        profile: {
          messId: body.identifier,
          rollNumber: body.rollNumber,
          contact: body.contact
        },
        identifier: body.identifier,
        name: body.name,
        password: body.password
      })
    }),
  getMenus: () => apiFetch('/menus'),
  getFoodItems: (params?: Record<string, string>) => {
    const query = params ?
      '?' + new URLSearchParams(params).toString() :
      ''
    return apiFetch(`/food-items${query}`)
  },
  addToCart: (foodId: string, quantity: number) =>
    apiFetch('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ food_id: foodId, quantity })
    }),
  getCart: () => apiFetch('/cart'),
  clearCart: () =>
    apiFetch('/cart', {
      method: 'DELETE'
    }),
  removeCartItem: (cartItemId: string) =>
    apiFetch(`/cart/item/${cartItemId}`, {
      method: 'DELETE'
    }),
  createOrder: (payload: any) =>
    apiFetch('/order/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  trackOrder: (ticketId: string) =>
    apiFetch(`/order/ticket/${ticketId}`),
  getMyOrders: () => apiFetch('/order/history'),
  getQueue: (status?: string) => {
    const query = status ? `?status=${status}` : ''
    return apiFetch(`/queue${query}`)
  },
  updateOrderStatus: (orderId: string, status: string, note?: string) =>
    apiFetch(`/order/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    }),
  cancelOrder: (orderId: string) =>
    apiFetch(`/order/${orderId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({})
    }),
  getUsers: () => apiFetch('/users'),
  createUser: (body: { identifier: string; name: string; password: string; role: string }) =>
    apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  updateUser: (id: string, role: string) =>
    apiFetch(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    }),
  deleteUser: (id: string) =>
    apiFetch(`/users/${id}`, {
      method: 'DELETE'
    }),
  createFoodItem: (payload: Record<string, unknown>) =>
    apiFetch('/food-item', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getOrderReport: () => apiFetch('/reports/orders')
}


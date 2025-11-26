export type FoodItem = {
  _id: string
  name: string
  description?: string
  unitPrice: number
  category: string
  isSpecial?: boolean
  available?: boolean
  pickupWindow?: {
    start?: string
    end?: string
  }
  tags?: string[]
}

export type CartItem = {
  _id: string
  quantity: number
  foodItem: FoodItem
}

export type Cart = {
  _id: string
  cartItems: CartItem[]
  total?: number
}

export type CustomerProfile = {
  messId: string
  name: string
  rollNumber: string
  contact?: string
}

export type OrderStatus = 'Queued' | 'Preparing' | 'Ready' | 'Collected' | 'Cancelled'

export type AuthUser = {
  id: string
  identifier: string
  name: string
  role: 'student' | 'staff' | 'admin'
  profile?: CustomerProfile
}

export type UserAccount = {
  id: string
  identifier: string
  name: string
  role: 'student' | 'staff' | 'admin'
  profile?: CustomerProfile
  createdAt?: string
}

export type Order = {
  _id: string
  ticketId: string
  queueNumber: number
  status: OrderStatus
  estimatedPickup?: string
  orderItems: {
    food: string
    quantity: number
    unitPrice: number
  }[]
  customer: CustomerProfile
  statusHistory: {
    status: OrderStatus
    note?: string
    changedAt: string
  }[]
  notificationLog?: {
    channel: string
    message: string
    createdAt: string
  }[]
  total?: number
  createdAt?: string
  updatedAt?: string
}


export enum EPaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
}

export enum EOrderStatus {
  PENDING = 'PENDING',
  CONFIRM = 'CONFIRM',
  DELIVERY = 'DELIVERY',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
}

export interface ICreateOrderRequest {
  paymentMethod: EPaymentMethod
  shippingAddress: {
    province: string
    district: string
    ward: string
    address: string
    fullname: string
    phone: string
    latitude?: number | null
    longitude?: number | null
  }
  orderItems: {
    productId: number
    amount: number
  }[]
}

export interface IOrderResponse {
  id: number
  paymentMethod: EPaymentMethod
  status: EOrderStatus
  totalPrice: number
  isPaid: boolean
  orderCode: string
  userId: number
  shippingFee?: number
  distanceKm?: number | null
  storeName?: string | null
  shippingAddress: {
    province: string
    district: string
    ward: string
    address: string
    fullname: string
    phone: string
  }
  orderItems: {
    productId: number
    amount: number
    price: number
    productName: string
  }[]
  createdAt: string
  updatedAt: string
}

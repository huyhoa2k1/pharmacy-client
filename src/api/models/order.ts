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
    email?: string
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
  useId: number
  shippingAddress: {
    province: string
    district: string
    ward: string
    address: string
    fullname: string
    phone: string
    email?: string
  }
  orderItems: {
    productId: number
    amount: number
    price: number
    productName: string
  }[]
  updatedAt: string
}

import axiosInstance from '@/helpers/https'

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export interface IPaymentLink {
  checkoutUrl: string
  orderCode: number
}

export interface IPaymentStatus {
  orderId: number
  orderCode: string
  payosOrderCode: number
  paymentStatus: PaymentStatus
  orderStatus: string
  amount: number
}

export class PaymentService {
  public static readonly createPaymentLink: (orderId: number) => Promise<IPaymentLink> = async (
    orderId,
  ) => axiosInstance.post('/payments/create-payment-link', { orderId }).then((res) => res.data)

  // Backend đối chiếu với PayOS nếu webhook chưa tới, nên luôn trả trạng thái mới nhất
  public static readonly getPaymentStatus: (payosOrderCode: string) => Promise<IPaymentStatus> =
    async (payosOrderCode) =>
      axiosInstance.get(`/payments/status/${payosOrderCode}`).then((res) => res.data)
}

import axiosInstance from '@/helpers/https'

export class PaymentService {
  public static readonly createPaymentLink: (requestObj: any) => Promise<any> = async (
    requestObj,
  ) => axiosInstance.post('/payments/create-payment-link', requestObj).then((res) => res.data)
}

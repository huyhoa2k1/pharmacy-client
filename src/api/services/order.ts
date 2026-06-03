import axiosInstance from '@/helpers/https'
import type { ICreateOrderRequest, IOrderResponse } from '../models/order'
import { EOrderStatus } from '../models/order'

export class OrderService {
  public static readonly createOrder: (requestObj: ICreateOrderRequest) => Promise<any> = async (
    requestObj,
  ) => axiosInstance.post('/orders', requestObj).then((res) => res.data)
  public static readonly getOrders: () => Promise<IOrderResponse[]> = async () =>
    axiosInstance.get('/orders').then((res) => res.data)
  public static readonly updateOrderStatus: (
    orderId: number,
    status: EOrderStatus,
  ) => Promise<IOrderResponse> = async (orderId, status) =>
    axiosInstance.patch(`/orders/status`, { orderId, status }).then((res) => res.data)
}

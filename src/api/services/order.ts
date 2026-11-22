import axiosInstance from '@/helpers/https'
import type { ICreateOrderRequest, IOrderResponse } from '../models/order'
import type { IPageResponse } from '../models/product'
import type { IPagerRequest } from '../models/pager'
import { EOrderStatus } from '../models/order'
import { fetchAllPages } from './pager'

export interface IOrderQueryRequest {
  userId?: number
  pager?: IPagerRequest
}

export class OrderService {
  public static readonly createOrder: (requestObj: ICreateOrderRequest) => Promise<any> = async (
    requestObj,
  ) => axiosInstance.post('/orders', requestObj).then((res) => res.data)
  public static readonly getOrdersPage: (
    request: IOrderQueryRequest,
  ) => Promise<IPageResponse<IOrderResponse>> = async (request) =>
    axiosInstance.post('/orders/getAllOrders', request).then((res) => res.data)
  public static readonly getOrders: () => Promise<IOrderResponse[]> = async () =>
    fetchAllPages(OrderService.getOrdersPage, {})
  public static readonly updateOrderStatus: (
    orderId: number,
    status: EOrderStatus,
  ) => Promise<IOrderResponse> = async (orderId, status) =>
    axiosInstance.patch(`/orders/status`, { orderId, status }).then((res) => res.data)
  public static readonly getOrderByUserId: (userId: number) => Promise<IOrderResponse[]> = async (
    userId,
  ) => fetchAllPages(OrderService.getOrdersPage, { userId })
  public static readonly exportOrders: () => Promise<Blob> = async () =>
    axiosInstance
      .post(
        '/export/orders',
        {},
        {
          responseType: 'blob',
        },
      )
      .then((res) => res.data)
}

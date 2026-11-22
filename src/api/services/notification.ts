import axiosInstance from '@/helpers/https'
import type { IPageResponse } from '../models/product'
import type { IPagerRequest } from '../models/pager'
import { fetchAllPages } from './pager'

export interface INotificationQueryRequest {
  pager?: IPagerRequest
}

export class NotificationService {
  public static readonly getNotificationsPage: (
    request: INotificationQueryRequest,
  ) => Promise<IPageResponse<any>> = async (request) =>
    axiosInstance.post('/notifications/getAllNotifications', request).then((res) => res.data)

  public static readonly getAllNotifications: () => Promise<any[]> = async () =>
    fetchAllPages(NotificationService.getNotificationsPage, {})

  public static readonly markNotificationAsRead: () => Promise<any[]> = async () =>
    axiosInstance.post<any[]>('/notifications/mark-all-read').then((res) => res.data)
}

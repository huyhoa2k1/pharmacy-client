import axiosInstance from '@/helpers/https'

export class NotificationService {
  public static readonly getAllNotifications: () => Promise<any[]> = async () =>
    axiosInstance.get<any[]>('/notifications').then((res) => res.data)

  public static readonly markNotificationAsRead: () => Promise<any[]> = async () =>
    axiosInstance.post<any[]>('/notifications/mark-all-read').then((res) => res.data)
}

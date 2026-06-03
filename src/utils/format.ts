import { EOrderStatus } from '@/api/models/order'

export const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

export const formatStatusOrder = (status: EOrderStatus) => {
  const statusMap: Record<EOrderStatus, Record<string, string>> = {
    [EOrderStatus.PENDING]: { color: 'orange', text: 'Đang chờ' },
    [EOrderStatus.CONFIRM]: { color: 'blue', text: 'Đã xác nhận' },
    [EOrderStatus.DELIVERY]: { color: 'green', text: 'Đang giao hàng' },
    [EOrderStatus.COMPLETE]: { color: 'success', text: 'Đã hoàn thành' },
    [EOrderStatus.CANCEL]: { color: 'error', text: 'Đã hủy' },
  }
  return statusMap[status]
}

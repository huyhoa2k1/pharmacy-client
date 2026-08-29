import { EOrderStatus } from '@/api/models/order'

export const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

export const formatStatusOrder = (status: EOrderStatus) => {
  const statusMap: Record<EOrderStatus, Record<string, string>> = {
    [EOrderStatus.PENDING]: { color: '#475569', text: 'Đang chờ' },
    [EOrderStatus.CONFIRM]: { color: '#0891B2', text: 'Đã xác nhận' },
    [EOrderStatus.DELIVERY]: { color: '#164E63', text: 'Đang giao hàng' },
    [EOrderStatus.COMPLETE]: { color: '#059669', text: 'Đã hoàn thành' },
    [EOrderStatus.CANCEL]: { color: '#DC2626', text: 'Đã hủy' },
  }
  return statusMap[status]
}

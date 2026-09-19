import { EOrderStatus } from '@/api/models/order'
import i18n from '@/i18n'

export const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

export const formatStatusOrder = (status: EOrderStatus) => {
  const { t } = i18n.global
  const statusMap: Record<EOrderStatus, Record<string, string>> = {
    [EOrderStatus.PENDING]: { color: '#475569', text: t('orderStatus.pending') },
    [EOrderStatus.CONFIRM]: { color: '#0891B2', text: t('orderStatus.confirm') },
    [EOrderStatus.DELIVERY]: { color: '#164E63', text: t('orderStatus.delivery') },
    [EOrderStatus.COMPLETE]: { color: '#059669', text: t('orderStatus.complete') },
    [EOrderStatus.CANCEL]: { color: '#DC2626', text: t('orderStatus.cancel') },
  }
  return statusMap[status]
}


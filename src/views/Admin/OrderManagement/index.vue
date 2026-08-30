<template>
  <div class="order-management">
    <AdminTableToolbar>
      <template #search>
        <AdminSearch
          v-model="searchText"
          label="Tìm đơn hàng"
          placeholder="Tìm mã đơn, khách hàng hoặc số điện thoại..."
          @search="resetPage"
        />
      </template>
      <template #filters>
        <AdminFilterBar label="Lọc đơn hàng" @reset="resetFilters">
          <a-select
            v-model:value="paymentFilter"
            aria-label="Lọc phương thức thanh toán"
            class="order-filter"
            :options="paymentFilterOptions"
          />
          <a-select
            v-model:value="statusFilter"
            aria-label="Lọc trạng thái đơn hàng"
            class="order-filter"
            :options="statusFilterOptions"
          />
          <template #reset>Xóa bộ lọc</template>
        </AdminFilterBar>
      </template>
      <template #actions
        ><a-button :icon="h(FileExcelOutlined)" @click="exportOrders"
          >Xuất Excel</a-button
        ></template
      >
    </AdminTableToolbar>

    <AdminLoadingState v-if="loading" label="Đang tải danh sách đơn hàng..." />
    <AdminErrorState
      v-else-if="loadError"
      title="Không thể tải đơn hàng"
      description="Vui lòng kiểm tra kết nối và thử lại."
      @retry="loadOrders"
      ><template #action>Thử tải lại</template></AdminErrorState
    >
    <AdminEmptyState
      v-else-if="!filteredOrders.length"
      :title="hasActiveFilters ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng'"
      :description="
        hasActiveFilters
          ? 'Thử thay đổi từ khóa hoặc bộ lọc.'
          : 'Các đơn hàng mới sẽ xuất hiện tại đây.'
      "
    >
      <template #action
        ><a-button v-if="hasActiveFilters" type="primary" @click="resetFilters"
          >Xóa bộ lọc</a-button
        ></template
      >
    </AdminEmptyState>
    <AdminDataTable v-else :columns="columns" :data-source="paginatedOrders" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'orderCode'"
          ><strong class="order-code">{{ record.orderCode }}</strong></template
        >
        <template v-else-if="column.dataIndex === 'customerName'"
          ><div class="customer-cell">
            <strong>{{ record.customerName || 'Chưa có tên' }}</strong
            ><span>{{ record.phoneNumber || 'Chưa có số điện thoại' }}</span>
          </div></template
        >
        <template v-else-if="column.dataIndex === 'totalPrice'"
          ><strong class="order-total">{{ formatCurrency(record.totalPrice) }}</strong></template
        >
        <template v-else-if="column.dataIndex === 'paymentMethod'"
          ><AdminStatusBadge
            :label="paymentLabel(record.paymentMethod)"
            :tone="record.paymentMethod === EPaymentMethod.CASH ? 'warning' : 'info'"
        /></template>
        <template v-else-if="column.dataIndex === 'status'"
          ><AdminStatusBadge
            :label="formatStatusOrder(record.status).text"
            :tone="statusTone(record.status)"
        /></template>
        <template v-else-if="column.key === 'action'">
          <a-select
            v-model:value="selectedStatus[record.id]"
            class="order-status-select"
            :aria-label="`Cập nhật trạng thái đơn ${record.orderCode}`"
            @change="handleStatusChange(record.id, $event)"
            :loading="loadingIds.has(record.id)"
            :disabled="isSelectDisabled(record.status)"
          >
            <a-select-option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
              :disabled="isOptionDisabled(record.status, option.value)"
              >{{ option.label }}</a-select-option
            >
          </a-select>
        </template>
      </template>
      <template #pagination
        ><AdminPagination
          :current="currentPage"
          :page-size="pageSize"
          :total="filteredOrders.length"
          @change="handlePageChange"
          @size-change="handlePageSizeChange"
      /></template>
    </AdminDataTable>
  </div>
</template>

<script setup lang="ts">
import { EPaymentMethod, EOrderStatus, type IOrderResponse } from '@/api/models/order'
import { OrderService } from '@/api/services/order'
import {
  AdminDataTable,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterBar,
  AdminLoadingState,
  AdminPagination,
  AdminSearch,
  AdminStatusBadge,
  AdminTableToolbar,
} from '@/components/Admin'
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { columns } from './index.type'
import { formatStatusOrder } from '@/utils/format'
import { message, Modal } from 'ant-design-vue'
import { FileExcelOutlined } from '@ant-design/icons-vue'

type OrderRow = IOrderResponse & { customerName?: string; phoneNumber?: string }

const statusOptions = [
  { value: EOrderStatus.CONFIRM, label: 'Xác nhận' },
  { value: EOrderStatus.DELIVERY, label: 'Giao hàng' },
  { value: EOrderStatus.COMPLETE, label: 'Đã hoàn thành' },
  { value: EOrderStatus.CANCEL, label: 'Hủy' },
]
const orders = ref<OrderRow[]>([])
const selectedStatus = reactive<Record<number, EOrderStatus>>({})
const loadingIds = ref<Set<number>>(new Set())
const loading = ref(true)
const loadError = ref(false)
const searchText = ref('')
const paymentFilter = ref<EPaymentMethod | 'all'>('all')
const statusFilter = ref<EOrderStatus | 'all'>('all')
const currentPage = ref(1)
const pageSize = ref(10)
const paymentFilterOptions = [
  { label: 'Tất cả thanh toán', value: 'all' },
  { label: 'Thanh toán khi nhận hàng', value: EPaymentMethod.CASH },
  { label: 'Thanh toán trực tuyến', value: EPaymentMethod.CARD },
]
const statusFilterOptions = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Đang chờ', value: EOrderStatus.PENDING },
  ...statusOptions,
]

const filteredOrders = computed(() => {
  const keyword = searchText.value.trim().toLocaleLowerCase('vi-VN')
  return orders.value.filter((order) => {
    const matchesSearch =
      !keyword ||
      [order.orderCode, order.customerName, order.phoneNumber, String(order.id)].some((value) =>
        value?.toLocaleLowerCase('vi-VN').includes(keyword),
      )
    return (
      matchesSearch &&
      (paymentFilter.value === 'all' || order.paymentMethod === paymentFilter.value) &&
      (statusFilter.value === 'all' || order.status === statusFilter.value)
    )
  })
})
const paginatedOrders = computed(() =>
  filteredOrders.value.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value,
  ),
)
const hasActiveFilters = computed(
  () =>
    Boolean(searchText.value.trim()) ||
    paymentFilter.value !== 'all' ||
    statusFilter.value !== 'all',
)

const loadOrders = async () => {
  loading.value = true
  loadError.value = false
  try {
    const result = await OrderService.getOrders()
    orders.value = result.map((order) => ({
      ...order,
      customerName: order.shippingAddress?.fullname,
      phoneNumber: order.shippingAddress?.phone,
    }))
    orders.value.forEach((order) => {
      selectedStatus[order.id] = order.status
    })
  } catch (error) {
    console.error(error)
    loadError.value = true
    message.error('Không thể tải danh sách đơn hàng')
  } finally {
    loading.value = false
  }
}
const getStatusLabel = (status: EOrderStatus) =>
  statusOptions.find((option) => option.value === status)?.label ?? 'Đang chờ'
const isSelectDisabled = (status: EOrderStatus) =>
  status === EOrderStatus.COMPLETE || status === EOrderStatus.CANCEL
const isOptionDisabled = (currentStatus: EOrderStatus, optionStatus: EOrderStatus) =>
  isSelectDisabled(currentStatus) ||
  (currentStatus === EOrderStatus.DELIVERY &&
    (optionStatus === EOrderStatus.CONFIRM || optionStatus === EOrderStatus.CANCEL))
const handleStatusChange = async (orderId: number, newStatus: EOrderStatus) => {
  const currentOrder = orders.value.find((order) => order.id === orderId)
  const currentStatus = currentOrder?.status
  const currentLabel = getStatusLabel(currentStatus as EOrderStatus)
  const newLabel = getStatusLabel(newStatus)
  return new Promise<void>((resolve) =>
    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn thay đổi từ "${currentLabel}" sang "${newLabel}"?`,
      okText: 'Có, thay đổi',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          loadingIds.value.add(orderId)
          const updatedOrder = await OrderService.updateOrderStatus(orderId, newStatus)
          const index = orders.value.findIndex((order) => order.id === orderId)
          if (index !== -1) orders.value[index].status = updatedOrder.status
          message.success('Cập nhật trạng thái đơn hàng thành công')
        } catch (error) {
          console.error(error)
          message.error('Cập nhật trạng thái đơn hàng thất bại')
          if (currentOrder) selectedStatus[orderId] = currentOrder.status
        } finally {
          loadingIds.value.delete(orderId)
          resolve()
        }
      },
      onCancel: () => {
        selectedStatus[orderId] = currentStatus as EOrderStatus
        resolve()
      },
    }),
  )
}
const exportOrders = async () => {
  try {
    const blob = await OrderService.exportOrders()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'orders-list.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    message.error('Xuất Excel thất bại')
  }
}
const formatCurrency = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
const paymentLabel = (paymentMethod: EPaymentMethod) =>
  paymentMethod === EPaymentMethod.CASH ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'
const statusTone = (status: EOrderStatus) =>
  status === EOrderStatus.COMPLETE
    ? 'success'
    : status === EOrderStatus.CANCEL
      ? 'danger'
      : status === EOrderStatus.PENDING
        ? 'neutral'
        : status === EOrderStatus.CONFIRM
          ? 'info'
          : 'warning'
const resetPage = () => {
  currentPage.value = 1
}
const resetFilters = () => {
  searchText.value = ''
  paymentFilter.value = 'all'
  statusFilter.value = 'all'
  resetPage()
}
const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
}
const handlePageSizeChange = (_current: number, size: number) => {
  pageSize.value = size
  resetPage()
}

watch([searchText, paymentFilter, statusFilter, pageSize], resetPage)
onMounted(loadOrders)
</script>

<style scoped>
.order-filter {
  width: min(100%, 220px);
}
.order-code,
.order-total {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.customer-cell {
  display: grid;
  gap: 2px;
  min-width: 180px;
}
.customer-cell span {
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
}
.order-status-select {
  width: 180px;
}
@media (max-width: 640px) {
  .order-filter {
    width: 100%;
  }
}
</style>

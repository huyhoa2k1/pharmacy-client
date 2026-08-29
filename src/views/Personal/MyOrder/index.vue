<template>
  <section class="orders-section">
    <header class="orders-header">
      <div>
        <p class="section-eyebrow">Lịch sử mua hàng</p>
        <h2 class="section-title">Đơn hàng của tôi</h2>
        <p class="section-description">
          Theo dõi trạng thái và xem lại chi tiết các đơn thuốc của bạn.
        </p>
      </div>
      <div class="orders-count">
        <strong>{{ ordersData.length }}</strong>
        <span>đơn hàng</span>
      </div>
    </header>

    <a-tabs v-model:activeKey="activeKey" class="orders-tabs" @tabClick="handleChange">
      <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.label" />
    </a-tabs>

    <div class="orders-list">
      <a-table
        :columns="tableColumns"
        :data-source="displayOrders"
        :row-key="'id'"
        :pagination="{ pageSize: 8, showSizeChanger: false }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'total'">
            {{ formatPrice(record.total) }}
          </template>
          <template v-else-if="column.dataIndex === 'statusText'">
            <a-tag :color="formatStatusOrder(record.raw.status).color">{{
              record.statusText
            }}</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'paymentMethod'">
            {{ record.raw.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Thanh toán online' }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" class="view-order-button" @click="viewOrder(record.raw)"
              >Xem chi tiết</a-button
            >
          </template>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:open="detailVisible"
      title="Chi tiết đơn hàng"
      :footer="null"
      class="order-detail-modal"
    >
      <div v-if="selectedOrder" class="order-detail">
        <div class="order-detail__summary">
          <div>
            <span>Mã đơn</span>
            <strong>{{ selectedOrder.orderCode }}</strong>
          </div>
          <a-tag :color="formatStatusOrder(selectedOrder.status).color">
            {{ formatStatusOrder(selectedOrder.status).text }}
          </a-tag>
        </div>

        <dl class="order-detail__information">
          <div>
            <dt>Ngày đặt</dt>
            <dd>{{ formatDate(selectedOrder.createdAt || selectedOrder.updatedAt) }}</dd>
          </div>
          <div>
            <dt>Phương thức thanh toán</dt>
            <dd>{{ selectedOrder.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Thanh toán online' }}</dd>
          </div>
          <div class="order-detail__address">
            <dt>Địa chỉ giao hàng</dt>
            <dd>
              {{ selectedOrder.shippingAddress?.fullname }} -
              {{ selectedOrder.shippingAddress?.phone }}<br />
              {{ selectedOrder.shippingAddress?.address }},
              {{ selectedOrder.shippingAddress?.ward }},
              {{ selectedOrder.shippingAddress?.district }},
              {{ selectedOrder.shippingAddress?.province }}
            </dd>
          </div>
        </dl>

        <div class="order-detail__items">
          <h3>Sản phẩm</h3>
          <ul>
            <li v-for="item in selectedOrder.orderItems" :key="item.productId">
              <span
                >{{ item.productName }} <small>x{{ item.amount }}</small></span
              >
              <strong>{{ formatPrice(item.price * item.amount) }}</strong>
            </li>
          </ul>
        </div>

        <div class="order-detail__total">
          <span>Tổng thanh toán</span>
          <strong>{{ formatPrice(selectedOrder.totalPrice) }}</strong>
        </div>
      </div>
    </a-modal>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, h } from 'vue'
import { OrderService } from '@/api/services/order'
import { EOrderStatus, type IOrderResponse } from '@/api/models/order'
import { formatStatusOrder, formatPrice } from '@/utils/format'
import { useUserStore } from '@/stores/user'
import { message, Input, Button, Space } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'

const ordersData = ref<IOrderResponse[]>([])
const userStore = useUserStore()
const userId = computed(() => (userStore.isLogin ? userStore.userId : undefined))

const getOrdersByUser = async () => {
  if (!userId.value) return
  try {
    const res = await OrderService.getOrderByUserId(userId.value)
    ordersData.value = res || []
  } catch {
    message.error('Tải đơn hàng thất bại')
  }
}

onMounted(() => {
  if (userId.value) getOrdersByUser()
})

watch(userId, (val) => {
  if (val) getOrdersByUser()
})

const tabs = [
  { key: 'ALL', label: 'Tất cả' },
  ...Object.values(EOrderStatus).map((s) => ({
    key: s,
    label: formatStatusOrder(s as EOrderStatus).text,
  })),
]

const activeKey = ref<string>(tabs.length ? (tabs[0].key as string) : ('ALL' as string))

const filteredOrders = computed(() =>
  activeKey.value === 'ALL'
    ? ordersData.value
    : ordersData.value.filter((o) => o.status === (activeKey.value as EOrderStatus)),
)
const formatDate = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN')
}

const displayOrders = computed(() =>
  filteredOrders.value.map((o) => ({
    id: o.id,
    date: formatDate((o as any).createdAt || (o as any).updatedAt),
    fullname: o.shippingAddress?.fullname || '',
    phone: o.shippingAddress?.phone || '',
    delivery: o.shippingAddress
      ? `${o.shippingAddress.address}, ${o.shippingAddress.ward}, ${o.shippingAddress.district}`
      : '',
    number: o.orderCode,
    statusText: formatStatusOrder(o.status).text,
    items: o.orderItems.map((it) => ({
      img: '/P08458_1.avif',
      title: it.productName,
      price: it.price,
      qty: it.amount,
    })),
    total: o.totalPrice,
    raw: o,
  })),
)

const tableColumns: any[] = [
  { title: 'Mã đơn', dataIndex: 'number', key: 'number' },
  {
    title: 'Ngày',
    dataIndex: 'date',
    key: 'date',
    sorter: (a: any, b: any) =>
      new Date(a.raw.createdAt || a.raw.updatedAt).getTime() -
      new Date(b.raw.createdAt || b.raw.updatedAt).getTime(),
    defaultSortOrder: 'descend',
  },
  {
    title: 'Người nhận',
    dataIndex: 'fullname',
    key: 'fullname',
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) =>
      h('div', { style: { padding: '8px' } }, [
        h(Input, {
          placeholder: 'Tìm tên người nhận',
          value: selectedKeys[0],
          onInput: (event: Event) => {
            const value = (event.target as HTMLInputElement).value
            setSelectedKeys(value ? [value] : [])
          },
          onPressEnter: () => confirm(),
          style: { marginBottom: '8px', display: 'block' },
        }),
        h(Space, { size: 'small' }, [
          h(
            Button,
            {
              type: 'primary',
              size: 'small',
              onClick: () => confirm(),
            },
            { default: () => 'Search' },
          ),
          h(
            Button,
            {
              size: 'small',
              onClick: () => {
                clearFilters?.()
                confirm()
              },
            },
            { default: () => 'Reset' },
          ),
        ]),
      ]),
    filterIcon: (filtered: boolean) =>
      h(SearchOutlined, { style: { color: filtered ? '#1890ff' : undefined } }),
    onFilter: (value: string, record: any) =>
      record.raw.shippingAddress?.fullname?.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'SĐT',
    dataIndex: 'phone',
    key: 'phone',
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) =>
      h('div', { style: { padding: '8px' } }, [
        h(Input, {
          placeholder: 'Tìm số điện thoại',
          value: selectedKeys[0],
          onInput: (event: Event) => {
            const value = (event.target as HTMLInputElement).value
            setSelectedKeys(value ? [value] : [])
          },
          onPressEnter: () => confirm(),
          style: { marginBottom: '8px', display: 'block' },
        }),
        h(Space, { size: 'small' }, [
          h(
            Button,
            {
              type: 'primary',
              size: 'small',
              onClick: () => confirm(),
            },
            { default: () => 'Search' },
          ),
          h(
            Button,
            {
              size: 'small',
              onClick: () => {
                clearFilters?.()
                confirm()
              },
            },
            { default: () => 'Reset' },
          ),
        ]),
      ]),
    filterIcon: (filtered: boolean) =>
      h(SearchOutlined, { style: { color: filtered ? '#1890ff' : undefined } }),
    onFilter: (value: string, record: any) =>
      record.raw.shippingAddress?.phone?.toString().toLowerCase().includes(value.toLowerCase()),
  },
  { title: 'Trạng thái', dataIndex: 'statusText', key: 'status' },
  { title: 'Tổng', dataIndex: 'total', key: 'total' },
  { title: 'Hành động', key: 'action' },
]

const detailVisible = ref(false)
const selectedOrder = ref<IOrderResponse | null>(null)

const viewOrder = (order: IOrderResponse) => {
  if (!order) return
  selectedOrder.value = order
  detailVisible.value = true
}

const handleChange = (tab: any) => {
  const key = typeof tab === 'string' ? tab : (tab?.key ?? tab)
  activeKey.value = key
}
</script>

<style scoped>
.orders-section {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-card);
  box-shadow: var(--shadow-md);
}

.orders-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.section-eyebrow {
  margin: 0 0 var(--space-xs);
  color: var(--color-primary);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  color: var(--color-foreground);
  font-size: 1.5rem;
  line-height: 1.25;
}

.section-description {
  margin: var(--space-sm) 0 0;
  color: var(--color-muted-foreground);
}

.orders-count {
  display: grid;
  flex: 0 0 auto;
  min-width: 84px;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-primary);
  text-align: center;
}

.orders-count strong {
  font-family: Figtree, Arial, sans-serif;
  font-size: 1.5rem;
  line-height: 1;
}

.orders-count span {
  margin-top: var(--space-xs);
  color: var(--color-muted-foreground);
  font-size: 0.75rem;
}

.orders-tabs {
  padding: 0 var(--space-lg);
  background: var(--color-background);
}

:deep(.orders-tabs .ant-tabs-nav) {
  margin: 0;
}

:deep(.orders-tabs .ant-tabs-tab) {
  padding: var(--space-md) 0;
  color: var(--color-muted-foreground);
  font-weight: 600;
}

:deep(.orders-tabs .ant-tabs-tab:hover),
:deep(.orders-tabs .ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: var(--color-primary) !important;
}

:deep(.orders-tabs .ant-tabs-ink-bar) {
  background: var(--color-accent);
}

.orders-list {
  padding: var(--space-lg);
}

:deep(.orders-list .ant-table) {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.orders-list .ant-table-thead > tr > th) {
  background: var(--color-background);
  color: var(--color-foreground);
  font-weight: 700;
}

:deep(.orders-list .ant-table-tbody > tr > td) {
  color: var(--color-foreground);
}

:deep(.orders-list .ant-table-tbody > tr:hover > td) {
  background: var(--color-background) !important;
}

.view-order-button {
  color: var(--color-primary);
}

.view-order-button:hover {
  color: var(--color-accent) !important;
}

.order-detail {
  color: var(--color-foreground);
}

.order-detail__summary,
.order-detail__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.order-detail__summary {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-background);
}

.order-detail__summary span,
.order-detail__information dt {
  display: block;
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
}

.order-detail__summary strong {
  font-size: 1.125rem;
}

.order-detail__information {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
  margin: var(--space-lg) 0;
}

.order-detail__information > div {
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.order-detail__information .order-detail__address {
  grid-column: 1 / -1;
}

.order-detail__information dd {
  margin: var(--space-xs) 0 0;
  color: var(--color-foreground);
  line-height: 1.65;
}

.order-detail__items h3 {
  margin: 0 0 var(--space-sm);
  color: var(--color-foreground);
  font-size: 1rem;
}

.order-detail__items ul {
  display: grid;
  gap: var(--space-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.order-detail__items li {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.order-detail__items small {
  color: var(--color-muted-foreground);
}

.order-detail__total {
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 2px solid var(--color-border);
  font-weight: 700;
}

.order-detail__total strong {
  color: var(--color-accent);
  font-size: 1.125rem;
}

@media (max-width: 767px) {
  .orders-header {
    align-items: flex-start;
    padding: var(--space-md);
  }

  .orders-tabs,
  .orders-list {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  :deep(.orders-tabs .ant-tabs-nav) {
    overflow-x: auto;
  }

  :deep(.orders-tabs .ant-tabs-nav-wrap) {
    min-width: max-content;
  }
}

@media (max-width: 575px) {
  .section-title {
    font-size: 1.25rem;
  }

  .section-description {
    font-size: 0.875rem;
  }

  .orders-count {
    min-width: 64px;
    padding: var(--space-sm);
  }

  .order-detail__information {
    grid-template-columns: 1fr;
  }
}
</style>

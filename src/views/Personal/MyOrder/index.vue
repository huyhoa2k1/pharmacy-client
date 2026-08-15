<template>
    <a-tabs v-model:activeKey="activeKey" centered @tabClick="handleChange"
        style="border-top-left-radius: 8px; border-top-right-radius: 8px; background-color: #fff;">
        <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.label" />
    </a-tabs>

    <div class="orders-list">
        <a-table :columns="tableColumns" :data-source="displayOrders" :row-key="'id'">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'total'">
                    {{ formatPrice(record.total) }}
                </template>
                <template v-else-if="column.dataIndex === 'status'">
                    <a-tag :color="formatStatusOrder(record.raw.status).color">{{ record.statusText }}</a-tag>
                </template>
                <template v-else-if="column.dataIndex === 'paymentMethod'">
                    {{ record.raw.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Thanh toán online' }}
                </template>
                <template v-else-if="column.key === 'action'">
                    <a-button type="link" @click="viewOrder(record.raw)">Xem</a-button>
                </template>
            </template>
        </a-table>

        <a-modal v-model:open="detailVisible" title="Chi tiết đơn hàng" :footer="null">
            <div v-if="selectedOrder">
                <p><strong>Mã đơn:</strong> {{ selectedOrder.orderCode }}</p>
                <p><strong>Ngày:</strong> {{ formatDate(selectedOrder.createdAt || selectedOrder.updatedAt) }}</p>
                <p><strong>Địa chỉ giao:</strong>
                    <br />{{ selectedOrder.shippingAddress?.fullname }} - {{ selectedOrder.shippingAddress?.phone }}
                    <br />{{ selectedOrder.shippingAddress?.address }}, {{ selectedOrder.shippingAddress?.ward }}, {{
                        selectedOrder.shippingAddress?.district }}, {{ selectedOrder.shippingAddress?.province }}
                </p>
                <p><strong>Phương thức:</strong> {{ selectedOrder.paymentMethod === 'CASH' ? 'Tiền mặt' :
                    'Thanh toánonline' }}
                </p>
                <p><strong>Trạng thái:</strong>
                    <a-tag :color="formatStatusOrder(selectedOrder.status).color">{{
                        formatStatusOrder(selectedOrder.status).text }}</a-tag>
                </p>
                <div>
                    <strong>Items</strong>
                    <ul>
                        <li v-for="it in selectedOrder.orderItems" :key="it.productId">
                            {{ it.productName }} x{{ it.amount }} - {{ formatPrice(it.price) }}
                        </li>
                    </ul>
                </div>
                <p><strong>Tổng:</strong> {{ formatPrice(selectedOrder.totalPrice) }}</p>
            </div>
        </a-modal>
    </div>
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
        console.log('getOrdersByUser res', res)
        ordersData.value = res || []
    } catch (err) {
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
console.log('ordersData', ordersData.value)
console.log('filteredOrders', filteredOrders.value)

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
        status: String(o.status).toLowerCase(),
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

console.log('displayOrders', displayOrders.value)

const tableColumns: any[] = [
    { title: 'Mã đơn', dataIndex: 'number', key: 'number' },
    {
        title: 'Ngày',
        dataIndex: 'date',
        key: 'date',
        sorter: (a: any, b: any) =>
            new Date(a.raw.createdAt || a.raw.updatedAt).getTime() - new Date(b.raw.createdAt || b.raw.updatedAt).getTime(),
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
        filterIcon: (filtered: boolean) => h(SearchOutlined, { style: { color: filtered ? '#1890ff' : undefined } }),
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
        filterIcon: (filtered: boolean) => h(SearchOutlined, { style: { color: filtered ? '#1890ff' : undefined } }),
        onFilter: (value: string, record: any) =>
            record.raw.shippingAddress?.phone?.toString().toLowerCase().includes(value.toLowerCase()),
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
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
    // Antd may pass either the key or a tab object; normalize to key string
    const key = typeof tab === 'string' ? tab : tab?.key ?? tab
    activeKey.value = key
}
</script>

<style scoped>
:deep(.ant-tabs-nav) {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    margin: 0 !important;
}

.orders-list {
    margin-top: 12px
}
</style>

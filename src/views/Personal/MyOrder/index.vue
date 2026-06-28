<template>
    <a-tabs v-model:activeKey="activeKey" centered @tabClick="handleChange"
        style="border-top-left-radius: 8px; border-top-right-radius: 8px; background-color: #fff;">
        <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.label" />
    </a-tabs>

    <div class="orders-list">
        <MyOrderItem v-for="(o, i) in displayOrders" :key="i" :order="o" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import MyOrderItem from '../../../components/Personal/MyOrderItem.vue'
import { OrderService } from '@/api/services/order'
import { EOrderStatus, type IOrderResponse } from '@/api/models/order'
import { formatStatusOrder } from '@/utils/format'

const ordersData = ref<IOrderResponse[]>([])

const userInfo = localStorage.getItem('pharmacy_user')
const userId = userInfo ? JSON.parse(userInfo).userId : undefined

const getOrdersByUser = async () => {
    if (!userId) return
    const res = await OrderService.getOrderByUserId(userId)
    ordersData.value = res || []
}

onMounted(() => {
    getOrdersByUser()
})

const tabs = Object.values(EOrderStatus).map((s) => ({
    key: s,
    label: formatStatusOrder(s as EOrderStatus).text,
}))

const activeKey = ref<string>(tabs.length ? (tabs[0].key as string) : (EOrderStatus.PENDING as string))

const filteredOrders = computed(() =>
    ordersData.value.filter((o) => o.status === (activeKey.value as EOrderStatus)),
)

const formatDate = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('vi-VN')
}

const displayOrders = computed(() =>
    filteredOrders.value.map((o) => ({
        date: formatDate((o as any).createdAt || (o as any).updatedAt),
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

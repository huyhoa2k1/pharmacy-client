<template>
    <div>
        <div class="mb-4 gap-2">
            <a-button type="primary">Xuất Excel</a-button>
        </div>
        <a-table :columns="tableColumns" :data-source="orders" rowKey="id">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'totalPrice'">
                    {{ record.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) }}
                </template>
                <template v-else-if="column.dataIndex === 'paymentMethod'">
                    {{ record.paymentMethod === EPaymentMethod.CASH ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'
                    }}
                </template>
                <template v-else-if="column.dataIndex === 'status'">
                    <a-tag :color="formatStatusOrder(record.status).color">
                        {{ formatStatusOrder(record.status).text }}
                    </a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                    <a-select v-model:value="selectedStatus[record.id]" style="width: 150px"
                        placeholder="Chọn trạng thái" @change="(value: any) => handleStatusChange(record.id, value)"
                        :loading="loadingIds.has(record.id)" :disabled="isSelectDisabled(record.status)">
                        <a-select-option v-for="option in statusOptions" :key="option.value" :value="option.value"
                            :disabled="isOptionDisabled(record.status, option.value)">
                            {{ option.label }}
                        </a-select-option>
                    </a-select>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup lang="ts">
import { EPaymentMethod, EOrderStatus, type IOrderResponse } from "@/api/models/order";
import { OrderService } from "@/api/services/order";
import { computed, h, onMounted, ref, reactive } from "vue";
import { columns } from "./index.type";
import { formatStatusOrder } from "@/utils/format";
import { Input, Button, Space, message, Modal } from "ant-design-vue";
import { SearchOutlined } from "@ant-design/icons-vue";

const statusOptions = [
    { value: EOrderStatus.CONFIRM, label: 'Xác nhận' },
    { value: EOrderStatus.DELIVERY, label: 'Giao hàng' },
    { value: EOrderStatus.COMPLETE, label: 'Đã hoàn thành' },
    { value: EOrderStatus.CANCEL, label: 'Hủy' },
];

const orders = ref<IOrderResponse[]>([]);
const selectedStatus = reactive<Record<number, EOrderStatus>>({}); // Track selected status for each order
const loadingIds = ref<Set<number>>(new Set()); // Track loading state for each order

const tableColumns = computed(() =>
    columns.map((column) => {
        if (column.dataIndex === 'orderCode') {
            return {
                ...column,
                filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) =>
                    h('div', { style: { padding: '8px' } }, [
                        h(Input, {
                            placeholder: 'Tìm mã đơn hàng',
                            value: selectedKeys[0],
                            onInput: (event: Event) => {
                                const value = (event.target as HTMLInputElement).value;
                                setSelectedKeys(value ? [value] : []);
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
                                        clearFilters?.();
                                        confirm();
                                    },
                                },
                                { default: () => 'Reset' },
                            ),
                        ]),
                    ]),
                filterIcon: (filtered: boolean) =>
                    h(SearchOutlined, {
                        style: { color: filtered ? '#1890ff' : undefined },
                    }),
                onFilter: (value: string, record: any) =>
                    record.orderCode?.toString().toLowerCase().includes(value.toLowerCase()),
            }
        }

        return column
    }),
)

onMounted(async () => {
    const result = await OrderService.getOrders();
    orders.value = result.map((order: IOrderResponse) => ({
        ...order,
        customerName: order.shippingAddress?.fullname,
        phoneNumber: order.shippingAddress?.phone,
    }));
    // Initialize selected status with current status
    orders.value.forEach((order) => {
        selectedStatus[order.id] = order.status;
    });
});

const getStatusLabel = (status: EOrderStatus): string => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.label : status;
};

const isStatusLocked = (status: EOrderStatus): boolean =>
    status === EOrderStatus.COMPLETE || status === EOrderStatus.CANCEL;

const isSelectDisabled = (status: EOrderStatus): boolean =>
    status === EOrderStatus.COMPLETE || status === EOrderStatus.CANCEL;

const isOptionDisabled = (currentStatus: EOrderStatus, optionStatus: EOrderStatus): boolean =>
    isSelectDisabled(currentStatus) ||
    (currentStatus === EOrderStatus.DELIVERY &&
        (optionStatus === EOrderStatus.CONFIRM || optionStatus === EOrderStatus.CANCEL));

const handleStatusChange = async (orderId: number, newStatus: EOrderStatus) => {
    const currentOrder = orders.value.find((o) => o.id === orderId);
    const currentStatus = currentOrder?.status;
    const currentLabel = getStatusLabel(currentStatus as EOrderStatus);
    const newLabel = getStatusLabel(newStatus);

    return new Promise<void>((resolve) => {
        Modal.confirm({
            title: 'Xác nhận thay đổi trạng thái',
            content: `Bạn có chắc chắn muốn thay đổi từ "${currentLabel}" sang "${newLabel}"?`,
            okText: 'Có, thay đổi',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    loadingIds.value.add(orderId);

                    const updatedOrder = await OrderService.updateOrderStatus(orderId, newStatus);

                    const orderIndex = orders.value.findIndex((o) => o.id === orderId);
                    if (orderIndex !== -1) {
                        orders.value[orderIndex].status = updatedOrder.status;
                    }

                    message.success('Cập nhật trạng thái đơn hàng thành công');
                    resolve();
                } catch (error) {
                    message.error('Cập nhật trạng thái đơn hàng thất bại');
                    const orderIndex = orders.value.findIndex((o) => o.id === orderId);
                    if (orderIndex !== -1) {
                        selectedStatus[orderId] = orders.value[orderIndex].status;
                    }
                    resolve();
                } finally {
                    loadingIds.value.delete(orderId);
                }
            },
            onCancel: () => {
                selectedStatus[orderId] = currentStatus as EOrderStatus;
                resolve();
            },
        });
    });
};

</script>

<style scoped></style>
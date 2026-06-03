<template>
    <div>
        <div class="mb-4 flex gap-2">
            <a-button :hidden="selectedRowKeys.length === 0" type="primary" danger>Xóa sản phẩm</a-button>
            <a-button type="primary">Thêm sản phẩm</a-button>
            <a-button :hidden="selectedRowKeys.length === 0" type="primary">Sales sản phẩm</a-button>
            <a-button type="primary">Xuất Excel</a-button>
        </div>
        <a-table :columns="columns" :data-source="data" rowKey="id" :row-selection="rowSelection">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'price'">
                    {{ record.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) }}
                </template>
                <template v-else-if="column.dataIndex === 'isSale'">
                    <a-tag :color="record.isSale ? 'green' : 'red'">
                        {{ record.isSale ? 'On Sale' : 'Regular Price' }}
                    </a-tag>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup lang="ts">
import type { IGetProductResponse } from '@/api/models/product'
import { columns } from './index.type'
import { ProductService } from '@/api/services/product'
import { onMounted, ref, computed } from 'vue'

const data = ref<IGetProductResponse[]>([])
const selectedRowKeys = ref<any[]>([])

const getAllProducts = async () => {
    const res = await ProductService.getAllProducts();
    data.value = res;
}

onMounted(() => {
    getAllProducts()
})

const onSelectChange = (changeableRowKeys: any[]) => {
    selectedRowKeys.value = changeableRowKeys;
}

const rowSelection = computed(() => {
    return {
        selectedRowKeys: selectedRowKeys.value,
        onChange: onSelectChange,
    }
})
</script>

<style scoped></style>
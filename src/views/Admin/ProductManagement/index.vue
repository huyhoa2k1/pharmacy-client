<template>
    <div>
        <div class="mb-4 flex gap-2">
            <a-button :hidden="selectedRowKeys.length === 0" type="primary" danger :icon="h(DeleteOutlined)">
                Xóa sản phẩm
            </a-button>
            <router-link :to="{ name: 'admin-product-create' }">
                <a-button type="primary" :icon="h(PlusOutlined)">
                    Thêm sản phẩm
                </a-button>
            </router-link>
            <a-button :hidden="selectedRowKeys.length === 0" type="primary" :icon="h(TagOutlined)"
                @click="openSaleModal">
                Sales sản phẩm
            </a-button>
            <a-button type="primary" :icon="h(FileExcelOutlined)">
                Xuất Excel
            </a-button>
        </div>
        <a-modal v-model:visible="saleModalVisible" title="Cập nhật sale cho sản phẩm" okText="Lưu" cancelText="Hủy"
            @ok="handleSaleSubmit" @cancel="saleModalVisible = false">
            <a-form ref="saleFormRef" layout="vertical">
                <a-form-item label="Giảm giá (%)" name="discount">
                    <a-input-number v-model:value="saleForm.discount" :min="0" :max="100" style="width: 100%"
                        placeholder="Nhập discount" />
                </a-form-item>

                <a-form-item label="Thời gian kết thúc" name="saleEndTime">
                    <a-date-picker v-model:value="saleForm.saleEndTime" showTime format="DD/MM/YYYY HH:mm"
                        valueFormat="YYYY-MM-DDTHH:mm:ss" style="width: 100%" placeholder="Chọn ngày giờ kết thúc" />
                </a-form-item>
            </a-form>
        </a-modal>
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
import { message } from 'ant-design-vue'
import { onMounted, ref, reactive, computed, h } from 'vue'
import { DeleteOutlined, PlusOutlined, TagOutlined, FileExcelOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'

const data = ref<IGetProductResponse[]>([])
const selectedRowKeys = ref<any[]>([])
const saleModalVisible = ref(false)
const saleFormRef = ref<FormInstance | null>(null)
const saleForm = reactive({
    discount: null as number | null,
    saleEndTime: null as string | null,
})

const selectedProducts = computed(() =>
    data.value.filter((item) => selectedRowKeys.value.includes(item.id)),
)

const selectedNotSaleProducts = computed(() =>
    selectedProducts.value.filter((item) => !item.isSale),
)

const hasOnSaleSelected = computed(() =>
    selectedProducts.value.some((item) => item.isSale),
)

const canOpenSaleModal = computed(
    () => selectedProducts.value.length > 0 && !hasOnSaleSelected.value,
)

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

const openSaleModal = () => {
    if (selectedProducts.value.length === 0) {
        message.warning('Vui lòng chọn sản phẩm để sale');
        return
    }
    if (hasOnSaleSelected.value) {
        message.warning('Không thể sale sản phẩm đã đang onSale. Vui lòng bỏ chọn sản phẩm đang sale');
        return
    }
    saleForm.discount = null
    saleForm.saleEndTime = null
    saleModalVisible.value = true
}

const handleSaleSubmit = async () => {
    if (saleForm.discount === null || saleForm.discount < 0) {
        message.warning('Vui lòng nhập discount hợp lệ')
        return
    }
    if (!saleForm.saleEndTime) {
        message.warning('Vui lòng chọn thời gian kết thúc sale')
        return
    }

    try {
        const payload = {
            productIds: selectedNotSaleProducts.value.map((product) => product.id),
            isSale: true,
            discount: saleForm.discount,
            saleEndTime: saleForm.saleEndTime,
        }
        const result = await ProductService.setSaleProducts(payload)

        if (result) {
            message.success('Cập nhật sale thành công')
            saleModalVisible.value = false
            await getAllProducts()
        } else {
            message.error('Cập nhật sale thất bại')
        }
    } catch (error) {
        console.error(error)
        message.error('Cập nhật sale thất bại')
    }
}

const rowSelection = computed(() => {
    return {
        selectedRowKeys: selectedRowKeys.value,
        onChange: onSelectChange,
    }
})
</script>

<style scoped></style>
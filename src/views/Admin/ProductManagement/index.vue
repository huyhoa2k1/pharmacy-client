<template>
    <div class="product-management">
        <AdminTableToolbar>
            <template #search>
                <AdminSearch v-model="searchText" label="Tìm sản phẩm" placeholder="Tìm tên, mã hoặc thương hiệu..."
                    @search="resetPage" />
            </template>
            <template #filters>
                <AdminFilterBar label="Lọc sản phẩm" @reset="resetFilters">
                    <a-select v-model:value="saleFilter" aria-label="Lọc theo khuyến mãi" class="product-filter"
                        :options="saleFilterOptions" />
                    <a-select v-model:value="stockFilter" aria-label="Lọc theo tồn kho" class="product-filter"
                        :options="stockFilterOptions" />
                    <template #reset>Xóa lọc</template>
                </AdminFilterBar>
            </template>
            <template #actions>
                <router-link :to="{ name: 'admin-product-create' }">
                    <a-button type="primary" :icon="h(PlusOutlined)">
                        Thêm sản phẩm
                    </a-button>
                </router-link>
                <a-button :disabled="true" :icon="h(FileExcelOutlined)" title="Chức năng xuất Excel chưa khả dụng">
                    Xuất Excel
                </a-button>
            </template>
        </AdminTableToolbar>

        <div v-if="selectedRowKeys.length" class="product-selection-bar" role="status">
            <span><strong>{{ selectedRowKeys.length }}</strong> sản phẩm đã chọn</span>
            <div class="product-selection-bar__actions">
                <a-button type="primary" :icon="h(TagOutlined)" @click="openSaleModal">
                    Cập nhật khuyến mãi
                </a-button>
                <a-button danger :disabled="true" :icon="h(DeleteOutlined)"
                    title="Chức năng xóa sản phẩm chưa khả dụng">
                Xóa sản phẩm
                </a-button>
                <a-button type="link" @click="selectedRowKeys = []">Bỏ chọn</a-button>
            </div>
        </div>

        <AdminLoadingState v-if="loading" label="Đang tải danh sách sản phẩm..." />
        <AdminErrorState v-else-if="loadError" title="Không thể tải danh sách sản phẩm"
            description="Vui lòng kiểm tra kết nối và thử lại." @retry="getAllProducts">
            <template #action>Thử tải lại</template>
        </AdminErrorState>
        <AdminEmptyState v-else-if="!filteredProducts.length" :title="emptyStateTitle"
            :description="emptyStateDescription">
            <template #action>
                <a-button v-if="hasActiveFilters" type="primary" @click="resetFilters">Xóa bộ lọc</a-button>
                <router-link v-else :to="{ name: 'admin-product-create' }">
                    <a-button type="primary">Thêm sản phẩm</a-button>
                </router-link>
            </template>
        </AdminEmptyState>
        <AdminDataTable v-else :columns="columns" :data-source="paginatedProducts" row-key="id"
            :row-selection="rowSelection">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'name'">
                    <div class="product-cell">
                        <a-avatar shape="square" :size="44" :src="record.imageUrl?.[0]">
                            {{ record.name.charAt(0).toUpperCase() }}
                        </a-avatar>
                        <div class="product-cell__details">
                            <strong>{{ record.name }}</strong>
                            <span>{{ record.brand?.name || 'Chưa có thương hiệu' }}</span>
                            <span class="product-cell__code">#{{ record.id }}</span>
                        </div>
                    </div>
                </template>
                <template v-else-if="column.dataIndex === 'price'">
                    <div class="price-cell">
                        <strong>{{ formatCurrency(record.price) }}</strong>
                        <span v-if="record.isSale">Giảm {{ record.discount }}%</span>
                    </div>
                </template>
                <template v-else-if="column.dataIndex === 'amount'">
                    <AdminStatusBadge :label="stockStatus(record).label" :tone="stockStatus(record).tone" />
                </template>
                <template v-else-if="column.dataIndex === 'isSale'">
                    <AdminStatusBadge :label="record.isSale ? `Đang giảm ${record.discount}%` : 'Giá thường'"
                        :tone="record.isSale ? 'success' : 'neutral'" />
                </template>
                <template v-else-if="column.key === 'action'">
                    <AdminActionMenu :items="rowActions(record)" label="Thao tác sản phẩm"
                        @select="handleRowAction(record, $event)" />
                </template>
            </template>
            <template #pagination>
                <AdminPagination :current="currentPage" :page-size="pageSize" :total="filteredProducts.length"
                    @change="handlePageChange" @size-change="handlePageSizeChange" />
            </template>
        </AdminDataTable>

        <AdminModal :open="saleModalVisible" title="Cập nhật khuyến mãi" ok-text="Lưu khuyến mãi"
            :loading="submittingSale" @update:open="saleModalVisible = $event" @confirm="handleSaleSubmit"
            @cancel="saleModalVisible = false">
            <p class="sale-modal__description">
                Áp dụng khuyến mãi cho {{ selectedNotSaleProducts.length }} sản phẩm đã chọn.
            </p>
            <a-form ref="saleFormRef" layout="vertical">
                <a-form-item label="Giảm giá (%)" name="discount">
                    <a-input-number v-model:value="saleForm.discount" :min="0" :max="100" class="w-full"
                        placeholder="Nhập mức giảm giá" />
                </a-form-item>
                <a-form-item label="Thời gian kết thúc" name="saleEndTime">
                    <a-date-picker v-model:value="saleForm.saleEndTime" show-time format="DD/MM/YYYY HH:mm"
                        value-format="YYYY-MM-DDTHH:mm:ss" class="w-full" placeholder="Chọn ngày giờ kết thúc" />
                </a-form-item>
            </a-form>
        </AdminModal>
    </div>
</template>

<script setup lang="ts">
import type { IGetProductResponse } from '@/api/models/product'
import { columns } from './index.type'
import { ProductService } from '@/api/services/product'
import { message } from 'ant-design-vue'
import {
    AdminActionMenu,
    AdminDataTable,
    AdminEmptyState,
    AdminErrorState,
    AdminFilterBar,
    AdminLoadingState,
    AdminModal,
    AdminPagination,
    AdminSearch,
    AdminStatusBadge,
    AdminTableToolbar,
} from '@/components/Admin'
import { onMounted, ref, reactive, computed, h, watch } from 'vue'
import { DeleteOutlined, PlusOutlined, TagOutlined, FileExcelOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'

const data = ref<IGetProductResponse[]>([])
const selectedRowKeys = ref<number[]>([])
const saleModalVisible = ref(false)
const saleFormRef = ref<FormInstance | null>(null)
const loading = ref(true)
const loadError = ref(false)
const submittingSale = ref(false)
const searchText = ref('')
const saleFilter = ref<'all' | 'on-sale' | 'regular'>('all')
const stockFilter = ref<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')
const currentPage = ref(1)
const pageSize = ref(10)
const saleForm = reactive({
    discount: null as number | null,
    saleEndTime: null as string | null,
})

const saleFilterOptions = [
    { label: 'Tất cả khuyến mãi', value: 'all' },
    { label: 'Đang khuyến mãi', value: 'on-sale' },
    { label: 'Giá thường', value: 'regular' },
]

const stockFilterOptions = [
    { label: 'Tất cả tồn kho', value: 'all' },
    { label: 'Còn hàng', value: 'in-stock' },
    { label: 'Sắp hết hàng', value: 'low-stock' },
    { label: 'Hết hàng', value: 'out-of-stock' },
]

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

const filteredProducts = computed(() => {
    const keyword = searchText.value.trim().toLocaleLowerCase('vi-VN')

    return data.value.filter((product) => {
        const matchesSearch = !keyword || [product.name, product.slug, product.brand?.name, String(product.id)]
            .some((value) => value?.toLocaleLowerCase('vi-VN').includes(keyword))
        const matchesSale = saleFilter.value === 'all'
            || (saleFilter.value === 'on-sale' && product.isSale)
            || (saleFilter.value === 'regular' && !product.isSale)
        const matchesStock = stockFilter.value === 'all'
            || (stockFilter.value === 'in-stock' && product.amount > 10)
            || (stockFilter.value === 'low-stock' && product.amount > 0 && product.amount <= 10)
            || (stockFilter.value === 'out-of-stock' && product.amount === 0)

        return matchesSearch && matchesSale && matchesStock
    })
})

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredProducts.value.slice(start, start + pageSize.value)
})

const hasActiveFilters = computed(
    () => Boolean(searchText.value.trim()) || saleFilter.value !== 'all' || stockFilter.value !== 'all',
)

const emptyStateTitle = computed(() => hasActiveFilters.value ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm')
const emptyStateDescription = computed(() => hasActiveFilters.value
    ? 'Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc.'
    : 'Hãy thêm sản phẩm đầu tiên để bắt đầu quản lý danh mục.')

const getAllProducts = async () => {
    loading.value = true
    loadError.value = false
    try {
        const res = await ProductService.getAllProducts()
        data.value = res
    } catch (error) {
        console.error(error)
        loadError.value = true
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    getAllProducts()
})

const onSelectChange = (changeableRowKeys: number[]) => {
    selectedRowKeys.value = changeableRowKeys
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
        submittingSale.value = true
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
    } finally {
        submittingSale.value = false
    }
}

const formatCurrency = (value: number) =>
    value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

const stockStatus = (product: IGetProductResponse) => {
    if (product.amount === 0) return { label: 'Hết hàng', tone: 'danger' as const }
    if (product.amount <= 10) return { label: `Sắp hết: ${product.amount}`, tone: 'warning' as const }
    return { label: `Còn hàng: ${product.amount}`, tone: 'info' as const }
}

const rowActions = (product: IGetProductResponse) => [
    {
        key: 'sale',
        label: product.isSale ? 'Đang khuyến mãi' : 'Cập nhật khuyến mãi',
        disabled: product.isSale,
    },
]

const handleRowAction = (product: IGetProductResponse, action: string) => {
    if (action === 'sale') {
        selectedRowKeys.value = [product.id]
        openSaleModal()
    }
}

const handlePageChange = (page: number, size: number) => {
    currentPage.value = page
    pageSize.value = size
}

const handlePageSizeChange = (_current: number, size: number) => {
    pageSize.value = size
    currentPage.value = 1
}

const resetPage = () => {
    currentPage.value = 1
}

const resetFilters = () => {
    searchText.value = ''
    saleFilter.value = 'all'
    stockFilter.value = 'all'
    resetPage()
}

const rowSelection = computed(() => ({
    selectedRowKeys: selectedRowKeys.value,
    onChange: onSelectChange,
}))

watch([searchText, saleFilter, stockFilter, pageSize], resetPage)
</script>

<style scoped>
.product-management {
    min-width: 0;
}

.product-filter {
    width: min(100%, 190px);
}

.product-selection-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
    padding: var(--space-md);
    border: 1px solid color-mix(in srgb, var(--color-primary) 35%, var(--color-card));
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-primary) 8%, var(--color-card));
    color: var(--color-foreground);
}

.product-selection-bar__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
}

.product-cell {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    min-width: 220px;
}

.product-cell__details {
    display: grid;
    gap: 2px;
    min-width: 0;
}

.product-cell__details strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-cell__details span {
    color: var(--color-muted-foreground);
    font-size: 0.8125rem;
}

.product-cell__code {
    font-variant-numeric: tabular-nums;
}

.price-cell {
    display: grid;
    gap: 2px;
    white-space: nowrap;
}

.price-cell span {
    color: var(--color-accent);
    font-size: 0.75rem;
    font-weight: 700;
}

.sale-modal__description {
    margin: 0 0 var(--space-lg);
    color: var(--color-muted-foreground);
    line-height: 1.5;
}

@media (max-width: 640px) {
    .product-filter {
        width: 100%;
    }

    .product-selection-bar {
        align-items: stretch;
        flex-direction: column;
    }

    .product-selection-bar__actions {
        flex-direction: column;
    }

    .product-selection-bar__actions :deep(.ant-btn) {
        width: 100%;
    }
}
</style>
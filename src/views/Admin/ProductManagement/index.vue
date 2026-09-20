<template>
    <div class="product-management">
        <AdminTableToolbar>
            <template #search>
                <AdminSearch v-model="searchText" :label="t('adminProducts.searchLabel')"
                    :placeholder="t('adminProducts.searchPlaceholder')" @search="resetPage" />
            </template>
            <template #filters>
                <AdminFilterBar :label="t('adminProducts.filterLabel')" @reset="resetFilters">
                    <a-select v-model:value="saleFilter" :aria-label="t('adminProducts.filterBySale')"
                        class="product-filter" :options="saleFilterOptions" />
                    <a-select v-model:value="stockFilter" :aria-label="t('adminProducts.filterByStock')"
                        class="product-filter" :options="stockFilterOptions" />
                    <template #reset>{{ t('adminProducts.clearFilters') }}</template>
                </AdminFilterBar>
            </template>
            <template #actions>
                <router-link :to="{ name: 'admin-product-create' }">
                    <a-button type="primary" :icon="h(PlusOutlined)">
                        {{ t('adminProducts.addProduct') }}
                    </a-button>
                </router-link>
                <a-button :disabled="true" :icon="h(FileExcelOutlined)"
                    :title="t('adminProducts.exportExcelDisabledTitle')">
                    {{ t('adminProducts.exportExcel') }}
                </a-button>
            </template>
        </AdminTableToolbar>

        <div v-if="selectedRowKeys.length" class="product-selection-bar" role="status">
            <span>{{ t('adminProducts.selectedCount', { count: selectedRowKeys.length }) }}</span>
            <div class="product-selection-bar__actions">
                <a-button type="primary" :icon="h(TagOutlined)" @click="openSaleModal">
                    {{ t('adminProducts.updateSale') }}
                </a-button>
                <a-button danger :disabled="true" :icon="h(DeleteOutlined)"
                    :title="t('adminProducts.deleteProductDisabledTitle')">
                    {{ t('adminProducts.deleteProduct') }}
                </a-button>
                <a-button type="link" @click="selectedRowKeys = []">{{ t('adminProducts.deselect') }}</a-button>
            </div>
        </div>

        <AdminLoadingState v-if="loading" :label="t('adminProducts.loadingList')" />
        <AdminErrorState v-else-if="loadError" :title="t('adminProducts.loadErrorTitle')"
            :description="t('adminProducts.loadErrorDescription')" @retry="getAllProducts">
            <template #action>{{ t('adminProducts.reloadAction') }}</template>
        </AdminErrorState>
        <AdminEmptyState v-else-if="!filteredProducts.length" :title="emptyStateTitle"
            :description="emptyStateDescription">
            <template #action>
                <a-button v-if="hasActiveFilters" type="primary" @click="resetFilters">{{
                    t('adminProducts.clearFilters') }}</a-button>
                <router-link v-else :to="{ name: 'admin-product-create' }">
                    <a-button type="primary">{{ t('adminProducts.addProduct') }}</a-button>
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
                            <span>{{ record.brand?.name || t('adminProducts.noBrand') }}</span>
                            <span class="product-cell__code">#{{ record.id }}</span>
                        </div>
                    </div>
                </template>
                <template v-else-if="column.dataIndex === 'price'">
                    <div class="price-cell">
                        <strong>{{ formatCurrency(record.price) }}</strong>
                        <span v-if="record.isSale">{{ t('adminProducts.discountBadge', { discount: record.discount })
                            }}</span>
                    </div>
                </template>
                <template v-else-if="column.dataIndex === 'amount'">
                    <AdminStatusBadge :label="stockStatus(record).label" :tone="stockStatus(record).tone" />
                </template>
                <template v-else-if="column.dataIndex === 'isSale'">
                    <AdminStatusBadge
                        :label="record.isSale ? t('adminProducts.onSaleBadge', { discount: record.discount }) : t('adminProducts.regularPrice')"
                        :tone="record.isSale ? 'success' : 'neutral'" />
                </template>
                <template v-else-if="column.key === 'action'">
                    <AdminActionMenu :items="rowActions(record)" :label="t('adminProducts.rowActionsLabel')"
                        @select="handleRowAction(record, $event)" />
                </template>
            </template>
            <template #pagination>
                <AdminPagination :current="currentPage" :page-size="pageSize" :total="filteredProducts.length"
                    @change="handlePageChange" @size-change="handlePageSizeChange" />
            </template>
        </AdminDataTable>

        <AdminModal :open="saleModalVisible" :title="t('adminProducts.saleModalTitle')"
            :ok-text="t('adminProducts.saveSale')" :loading="submittingSale" @update:open="saleModalVisible = $event"
            @confirm="handleSaleSubmit" @cancel="saleModalVisible = false">
            <p class="sale-modal__description">
                {{ t('adminProducts.saleModalDescription', { count: selectedNotSaleProducts.length }) }}
            </p>
            <a-form ref="saleFormRef" layout="vertical">
                <a-form-item :label="t('adminProducts.discountLabel')" name="discount">
                    <a-input-number v-model:value="saleForm.discount" :min="0" :max="100" class="w-full"
                        :placeholder="t('adminProducts.discountPlaceholder')" />
                </a-form-item>
                <a-form-item :label="t('adminProducts.saleEndTimeLabel')" name="saleEndTime">
                    <a-date-picker v-model:value="saleForm.saleEndTime" show-time format="DD/MM/YYYY HH:mm"
                        value-format="YYYY-MM-DDTHH:mm:ss" class="w-full"
                        :placeholder="t('adminProducts.saleEndTimePlaceholder')" />
                </a-form-item>
            </a-form>
        </AdminModal>
    </div>
</template>

<script setup lang="ts">
import type { IGetProductResponse } from '@/api/models/product'
import { getColumns } from './index.type'
import { ProductService } from '@/api/services/product'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()
const columns = computed(() => getColumns(t))
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

const saleFilterOptions = computed(() => [
    { label: t('adminProducts.saleFilterAll'), value: 'all' },
    { label: t('adminProducts.saleFilterOnSale'), value: 'on-sale' },
    { label: t('adminProducts.saleFilterRegular'), value: 'regular' },
])

const stockFilterOptions = computed(() => [
    { label: t('adminProducts.stockFilterAll'), value: 'all' },
    { label: t('adminProducts.stockFilterInStock'), value: 'in-stock' },
    { label: t('adminProducts.stockFilterLowStock'), value: 'low-stock' },
    { label: t('adminProducts.stockFilterOutOfStock'), value: 'out-of-stock' },
])

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

const emptyStateTitle = computed(() => hasActiveFilters.value ? t('adminProducts.emptyTitleFiltered') : t('adminProducts.emptyTitleDefault'))
const emptyStateDescription = computed(() => hasActiveFilters.value
    ? t('adminProducts.emptyDescFiltered')
    : t('adminProducts.emptyDescDefault'))

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
        message.warning(t('adminProducts.selectProductsWarning'));
        return
    }
    if (hasOnSaleSelected.value) {
        message.warning(t('adminProducts.alreadyOnSaleWarning'));
        return
    }
    saleForm.discount = null
    saleForm.saleEndTime = null
    saleModalVisible.value = true
}

const handleSaleSubmit = async () => {
    if (saleForm.discount === null || saleForm.discount < 0) {
        message.warning(t('adminProducts.invalidDiscountWarning'))
        return
    }
    if (!saleForm.saleEndTime) {
        message.warning(t('adminProducts.selectEndTimeWarning'))
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
            message.success(t('adminProducts.saleUpdateSuccess'))
            saleModalVisible.value = false
            await getAllProducts()
        } else {
            message.error(t('adminProducts.saleUpdateFailed'))
        }
    } catch (error) {
        console.error(error)
        message.error(t('adminProducts.saleUpdateFailed'))
    } finally {
        submittingSale.value = false
    }
}

const formatCurrency = (value: number) =>
    value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

const stockStatus = (product: IGetProductResponse) => {
    if (product.amount === 0) return { label: t('adminProducts.outOfStock'), tone: 'danger' as const }
    if (product.amount <= 10) return { label: t('adminProducts.lowStock', { amount: product.amount }), tone: 'warning' as const }
    return { label: t('adminProducts.inStockCount', { amount: product.amount }), tone: 'info' as const }
}

const rowActions = (product: IGetProductResponse) => [
    {
        key: 'sale',
        label: product.isSale ? t('adminProducts.saleFilterOnSale') : t('adminProducts.updateSale'),
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
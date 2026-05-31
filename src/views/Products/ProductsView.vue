<template>
    <div class="products-wrapper">
        <div class="filter bg-white">
            <Filter v-model:filters="filters" />
        </div>
        <div>
            <div class="flex justify-between items-center gap-2 p-3">
                <div>
                    <span class="font-extrabold text-xl">Danh sách sản phẩm</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-extrabold">Sắp xếp theo: </span>
                    <div class="flex gap-2">
                        <a-button size="small" type="primary" @click="setSort('desc')">Giá giảm dần</a-button>
                        <a-button size="small" type="primary" @click="setSort('asc')">Giá tăng dần</a-button>
                    </div>
                </div>
            </div>
            <div class="products">
                <div v-for="item in data" class="product">
                    <ProductCard :data="item" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IGetProductResponse } from '@/api/models/product'
import { ProductService } from '@/api/services/product'
import Filter from '@/components/Filter/Filter.vue'
import ProductCard from '@/components/ProductCard/ProductCard.vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const data = ref<IGetProductResponse[]>([])
const filters = ref<Record<string, any>>({})
const brands = ref<number[]>([])
const sort = ref<string | null>(null)
const page = ref(0)
const size = ref(20)


const getAllProductsByCategory = async () => {
    const categoryId = Number(route.params.categoryId)
    const res = await ProductService.getProductsByCategory(categoryId, {
        brandIds: filters.value.brands,
        minPrice: filters.value.priceFrom,
        maxPrice: filters.value.priceTo,
        sortDirection: sort.value
    })
    data.value = res.content
}

function setSort(value: string | null) {
    sort.value = value
    page.value = 0
    getAllProductsByCategory()
}

watch(
    [filters, sort, () => route.params.categoryId],
    () => {
        page.value = 0
        getAllProductsByCategory()
    },
    { deep: true },
)

onMounted(() => {
    getAllProductsByCategory()
})
</script>

<style scoped>
.products-wrapper {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 24px;
}

.filter {
    position: sticky;
    top: 16px;
    height: calc(100vh - 0px);
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 12px;
}

.products {
    display: grid;
    grid-template-columns: repeat(4, minmax(200px, 1fr));
    gap: 16px;
}
</style>

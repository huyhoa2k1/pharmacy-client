<template>
  <section class="product-filter">
    <header class="product-filter__header">
      <div>
        <h2>Bộ lọc</h2>
        <p>Tìm sản phẩm phù hợp với bạn</p>
      </div>
      <button type="button" class="product-filter__reset" @click="reset">Xóa lọc</button>
    </header>

    <div class="product-filter__section">
      <h3>Khoảng giá</h3>
      <div class="product-filter__price-inputs">
        <a-input-number
          v-model:value="local.priceFrom"
          :min="0"
          :controls="false"
          :formatter="formatCurrencyInput"
          :parser="parseCurrencyInput"
          placeholder="Từ"
          class="product-filter__price-input"
        >
          <template #suffix>đ</template>
        </a-input-number>
        <span aria-hidden="true">-</span>
        <a-input-number
          v-model:value="local.priceTo"
          :min="0"
          :controls="false"
          :formatter="formatCurrencyInput"
          :parser="parseCurrencyInput"
          placeholder="Đến"
          class="product-filter__price-input"
        >
          <template #suffix>đ</template>
        </a-input-number>
      </div>
      <a-button type="primary" class="product-filter__apply" @click="apply">Áp dụng</a-button>

      <a-radio-group v-model:value="local.priceRange" class="product-filter__price-ranges">
        <a-radio :value="1">Dưới 100.000 đ</a-radio>
        <a-radio :value="2">100.000 đ - 300.000 đ</a-radio>
        <a-radio :value="3">Trên 300.000 đ</a-radio>
      </a-radio-group>
    </div>

    <div class="product-filter__section product-filter__section--brands">
      <h3>Thương hiệu</h3>
      <a-input
        v-model:value="brandSearch"
        placeholder="Tìm thương hiệu"
        allow-clear
        class="product-filter__brand-search"
      >
        <template #prefix><i class="pi pi-search" aria-hidden="true"></i></template>
      </a-input>
      <a-checkbox-group v-model:value="local.brands" class="product-filter__brands">
        <a-checkbox v-for="brand in filteredBrands" :key="brand.id" :value="brand.id">
          {{ brand.name }}
        </a-checkbox>
      </a-checkbox-group>
      <p v-if="!filteredBrands.length" class="product-filter__no-brands">
        Không tìm thấy thương hiệu.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { IGetBrandResponse } from '@/api/models/brand'
import { BrandService } from '@/api/services/brand'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps<{
  filters: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:filters': [filters: Record<string, unknown>]
}>()

const local = reactive({
  priceFrom: null as number | null,
  priceTo: null as number | null,
  priceRange: null as number | null,
  brands: [] as number[],
})

const initialized = ref(false)
const brandList = ref<IGetBrandResponse[]>([])
const brandSearch = ref('')

const filteredBrands = computed(() => {
  const query = brandSearch.value.trim().toLocaleLowerCase('vi-VN')
  if (!query) return brandList.value

  return brandList.value.filter((brand) => brand.name.toLocaleLowerCase('vi-VN').includes(query))
})

const getBrandByCategory = async () => {
  brandList.value = await BrandService.getBrandsByCategory(Number(route.params.categoryId))
}

const emitFilters = () => {
  emit('update:filters', {
    priceFrom: local.priceFrom ?? undefined,
    priceTo: local.priceTo ?? undefined,
    priceRange: local.priceRange,
    brands: [...local.brands],
  })
}

const formatCurrencyInput = (value: string | number | undefined) =>
  value ? new Intl.NumberFormat('vi-VN').format(Number(value)) : ''

const parseCurrencyInput = (value: string | undefined) => Number(value?.replace(/[^\d]/g, '') || 0)

function apply() {
  local.priceRange = null
  emitFilters()
}

function reset() {
  local.priceFrom = null
  local.priceTo = null
  local.priceRange = null
  local.brands = []
  brandSearch.value = ''
  emitFilters()
}

watch(
  () => local.priceRange,
  (value) => {
    if (value === 1) {
      local.priceFrom = null
      local.priceTo = 100000
    } else if (value === 2) {
      local.priceFrom = 100000
      local.priceTo = 300000
    } else if (value === 3) {
      local.priceFrom = 300000
      local.priceTo = null
    }

    if (initialized.value && value !== null) emitFilters()
  },
)

watch(
  () => local.brands,
  () => {
    if (initialized.value) emitFilters()
  },
  { deep: true },
)

watch(
  () => route.params.categoryId,
  async (newId, oldId) => {
    if (!newId || newId === oldId) return
    local.brands = []
    brandSearch.value = ''
    await getBrandByCategory()
    if (initialized.value) emitFilters()
  },
)

onMounted(async () => {
  await getBrandByCategory()
  local.priceFrom = typeof props.filters.priceFrom === 'number' ? props.filters.priceFrom : null
  local.priceTo = typeof props.filters.priceTo === 'number' ? props.filters.priceTo : null
  local.priceRange = typeof props.filters.priceRange === 'number' ? props.filters.priceRange : null
  local.brands = Array.isArray(props.filters.brands) ? [...(props.filters.brands as number[])] : []
  initialized.value = true
})
</script>

<style>
.product-filter {
  padding: var(--space-lg);
}

.product-filter__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.product-filter h2,
.product-filter h3,
.product-filter p {
  margin-top: 0;
}

.product-filter h2 {
  margin-bottom: 2px;
  font-size: 1.25rem;
}

.product-filter__header p {
  margin-bottom: 0;
  color: var(--color-muted-foreground);
  font-size: 0.75rem;
}

.product-filter__reset {
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: #047857;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 700;
}

.product-filter__reset:hover {
  color: #065F46;
  text-decoration: underline;
}

.product-filter__section {
  padding-top: var(--space-md);
  border-top: 1px solid #E2ECE9;
}

.product-filter__section + .product-filter__section {
  margin-top: var(--space-lg);
}

.product-filter h3 {
  margin-bottom: var(--space-sm);
  font-size: 0.9375rem;
}

.product-filter__price-inputs {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  color: var(--color-muted-foreground);
}

.product-filter__price-input {
  width: 100%;
}

.product-filter__apply {
  width: 100%;
  margin-top: var(--space-sm);
}

.product-filter__price-ranges,
.product-filter__brands {
  display: grid;
  gap: 10px;
}

.product-filter__price-ranges {
  margin-top: var(--space-md);
}

.product-filter__brand-search {
  margin-bottom: var(--space-sm);
}

.product-filter__brands .ant-checkbox-wrapper {
  margin-inline-start: 0;
  color: var(--color-foreground);
  line-height: 1.35;
}

.product-filter__no-brands {
  margin-bottom: 0;
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
}
</style>

<template>
  <section class="catalogue">
    <aside class="catalogue__sidebar" aria-label="Bộ lọc sản phẩm">
      <Filter v-model:filters="filters" />
    </aside>

    <main class="catalogue__content">
      <header class="catalogue__header">
        <div>
          <p class="catalogue__eyebrow">Mua sắm theo danh mục</p>
          <h1>Danh sách sản phẩm</h1>
          <p class="catalogue__result-count">
            {{ resultSummary }}
          </p>
        </div>

        <div class="catalogue__sort">
          <label for="product-sort">Sắp xếp theo</label>
          <a-select
            id="product-sort"
            v-model:value="sort"
            class="catalogue__sort-select"
            aria-label="Sắp xếp sản phẩm"
          >
            <a-select-option :value="null">Phổ biến nhất</a-select-option>
            <a-select-option value="asc">Giá: Thấp đến cao</a-select-option>
            <a-select-option value="desc">Giá: Cao đến thấp</a-select-option>
          </a-select>
        </div>
      </header>

      <div v-if="data.length" class="products">
        <ProductCard v-for="item in data" :key="item.id" :data="item" />
      </div>

      <div v-else class="catalogue__empty">
        <i class="pi pi-search" aria-hidden="true"></i>
        <h2>Không tìm thấy sản phẩm phù hợp</h2>
        <p>Hãy thử điều chỉnh khoảng giá hoặc lựa chọn thương hiệu khác.</p>
      </div>
    </main>
  </section>
</template>

<script setup lang="ts">
import type { IGetProductResponse, IPageResponse } from '@/api/models/product'
import { ProductService } from '@/api/services/product'
import Filter from '@/components/Filter/Filter.vue'
import ProductCard from '@/components/ProductCard/ProductCard.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const data = ref<IGetProductResponse[]>([])
const filters = ref<Record<string, unknown>>({})
const sort = ref<string | null>(null)
const response = ref<IPageResponse<IGetProductResponse> | null>(null)

const resultSummary = computed(() => {
  const count = response.value?.totalElements ?? data.value.length
  return `${new Intl.NumberFormat('vi-VN').format(count)} sản phẩm`
})

const getAllProductsByCategory = async () => {
  const categoryId = Number(route.params.categoryId)
  const res = await ProductService.getProductsByCategory(categoryId, {
    brandIds: filters.value.brands,
    minPrice: filters.value.priceFrom,
    maxPrice: filters.value.priceTo,
    sortDirection: sort.value,
  })

  response.value = res
  data.value = res.content
}

watch(
  [filters, sort, () => route.params.categoryId],
  () => {
    getAllProductsByCategory()
  },
  { deep: true },
)

onMounted(() => {
  getAllProductsByCategory()
})
</script>

<style>
.catalogue {
  display: grid;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  grid-template-columns: 272px minmax(0, 1fr);
  align-items: start;
  gap: var(--space-xl);
  padding: var(--space-sm) 0 var(--space-3xl);
}

.catalogue__sidebar {
  min-width: 0;
  position: sticky;
  top: var(--space-md);
  max-height: calc(100vh - var(--space-xl));
  overflow-y: auto;
  border: 1px solid #DCE9E5;
  border-radius: var(--radius-lg);
  background: var(--color-card);
  box-shadow: var(--shadow-sm);
}

.catalogue__content {
  min-width: 0;
}

.catalogue__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
  padding: var(--space-md) 0;
  border-bottom: 1px solid #DCE9E5;
}

.catalogue__eyebrow {
  margin: 0 0 var(--space-xs);
  color: #047857;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: var(--space-xs);
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 1.2;
}

.catalogue__result-count {
  margin-bottom: 0;
  color: var(--color-muted-foreground);
  font-size: 0.9375rem;
}

.catalogue__sort {
  display: grid;
  min-width: 210px;
  gap: 6px;
}

.catalogue__sort label {
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
  font-weight: 600;
}

.catalogue__sort-select {
  width: 100%;
}

.catalogue .products {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-md);
}

.catalogue__empty {
  display: grid;
  min-height: 320px;
  place-content: center;
  justify-items: center;
  padding: var(--space-xl);
  border: 1px dashed #A7C9C0;
  border-radius: var(--radius-lg);
  background: #F7FCFA;
  color: var(--color-muted-foreground);
  text-align: center;
}

.catalogue__empty i {
  margin-bottom: var(--space-md);
  color: #059669;
  font-size: 2rem;
}

.catalogue__empty h2 {
  margin-bottom: var(--space-xs);
  color: var(--color-card-foreground);
  font-size: 1.125rem;
}

.catalogue__empty p {
  margin-bottom: 0;
}

@media (max-width: 1200px) {
  .catalogue {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .catalogue__sidebar {
    position: static;
    max-height: none;
  }

  .catalogue .products {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .catalogue .products {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .catalogue {
    padding-top: 0;
  }

  .catalogue__header {
    align-items: stretch;
    flex-direction: column;
  }

  .catalogue__sort {
    min-width: 0;
  }

  .catalogue .products {
    gap: var(--space-sm);
  }
}

@media (max-width: 460px) {
  .catalogue .products {
    grid-template-columns: 1fr;
  }
}
</style>

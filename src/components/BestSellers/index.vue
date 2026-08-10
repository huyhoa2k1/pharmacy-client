<template>
  <section class="product-category-section py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h4 class="title">Sản phẩm bán chạy nhất</h4>
          <p class="subtitle">Các sản phẩm đã bán nhiều hơn hoặc bằng 5 lượt mua</p>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-10 text-gray-500">Đang tải sản phẩm...</div>
      <div v-else-if="products.length === 0" class="text-center py-10 text-gray-500">
        Chưa có sản phẩm bán chạy nào đủ điều kiện.
      </div>
      <div v-else class="carousel-wrap">
        <Carousel
          class="category-carousel"
          :value="products"
          :numVisible="numVisible"
          :numScroll="numScroll"
          :responsiveOptions="responsiveOptions"
        >
          <template #item="slotProps">
            <div class="carousel-item">
              <ProductCard :data="slotProps.data" />
            </div>
          </template>
        </Carousel>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Carousel from 'primevue/carousel'
import ProductCard from '@/components/ProductCard/ProductCard.vue'
import { ProductService } from '@/api/services/product'
import type { IGetProductResponse } from '@/api/models/product'
import { onMounted, ref } from 'vue'

const products = ref<IGetProductResponse[]>([])
const isLoading = ref(false)
const numVisible = 5
const numScroll = 3
const responsiveOptions = [
  {
    breakpoint: '1400px',
    numVisible: 5,
    numScroll: 2,
  },
  {
    breakpoint: '1024px',
    numVisible: 4,
    numScroll: 2,
  },
  {
    breakpoint: '768px',
    numVisible: 3,
    numScroll: 1,
  },
  {
    breakpoint: '640px',
    numVisible: 2,
    numScroll: 1,
  },
  {
    breakpoint: '480px',
    numVisible: 1,
    numScroll: 1,
  },
]

const getBestSellers = async () => {
  isLoading.value = true
  try {
    products.value = await ProductService.getBestSellingProducts(5)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  getBestSellers()
})
</script>

<style scoped>
:root {
  --primary: #8b5cf6;
  --muted: #6b7280;
}

.product-category-section {
  background: radial-gradient(circle at top left, rgba(251, 146, 60, 0.18), transparent 28%),
    linear-gradient(180deg, #fff7ed 0%, #fff1e0 48%, #ffffff 100%);
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(251, 146, 60, 0.18);
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #6d28d9;
  margin: 0;
}

.subtitle {
  margin-top: 0.5rem;
  color: var(--muted);
  font-size: 0.95rem;
}

.carousel-wrap {
  min-height: 360px;
}

.carousel-item {
  padding: 0.5rem;
}
</style>

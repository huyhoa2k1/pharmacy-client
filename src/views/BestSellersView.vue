<template>
  <main class="best-sellers-page">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h1 class="page-title">Sản phẩm bán chạy nhất</h1>
        <p class="page-description">Xem các sản phẩm đã bán nhiều hơn hoặc bằng 5 lượt mua.</p>
      </div>
      <BestSellers />
    </div>
  </main>
</template>

<script setup lang="ts">
import BestSellers from '@/components/BestSellers/index.vue'
</script>

<style scoped>
.best-sellers-page {
  min-height: calc(100vh - 120px);
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #3b3660;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #6b7280;
  font-size: 1rem;
}
</style>

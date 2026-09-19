<template>
  <main class="best-sellers-page">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h1 class="page-title">{{ t('bestSellers.pageTitle') }}</h1>
        <p class="page-description">{{ t('bestSellers.pageDescription') }}</p>
      </div>
      <BestSellers />
    </div>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BestSellers from '@/components/BestSellers/index.vue'

const { t } = useI18n()
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

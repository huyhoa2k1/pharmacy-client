<template>
  <a-spin v-if="globalLoading" size="large" tip="Đang tải..." class="global-loading" />
  <div class="app-shell">
    <Advertisement />
    <Header />
    <Navbar :categories="categories" />
    <div class="w-full max-w-7xl mx-auto my-6 px-4 py-3 sm:px-6 lg:px-8">
      <router-view></router-view>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header/Header.vue'
import Advertisement from '@/components/Advertisement/index.vue'
import Navbar from '@/components/Navbar/Navbar.vue'
import Footer from '@/components/Footer/Footer.vue'
import type { IGetCategoryResponse } from '@/api/models/category'
import { CategoryService } from '@/api/services/category'
import { onMounted, ref } from 'vue'
import { globalLoading } from '@/stores/loading'

const categories = ref<IGetCategoryResponse[]>([])

const fetchCategories = async () => {
  const res = await CategoryService.getAllCategories()
  categories.value = res
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.global-loading {
  position: fixed !important;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.45);
  display: flex !important;
  justify-content: center;
  align-items: center;
}

.app-shell {
  overflow-x: clip;
}
</style>

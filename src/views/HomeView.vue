<script setup lang="ts">
import type { IGetProductResponse } from '@/api/models/product';
import { ProductService } from '@/api/services/product';
import ProductCategory from '@/components/ProductCategory/index.vue';
import { onMounted, ref } from 'vue';
import { globalLoading } from '@/stores/loading'

const data = ref<IGetProductResponse[]>([]);

const getProductsOnSale = async () => {
  globalLoading.value = true;
  const res = await ProductService.getProductsOnSale();
  data.value = res;
  globalLoading.value = false;
}
onMounted(() => {
  getProductsOnSale();
});
</script>

<template>
  <main>
    <ProductCategory :data="data" />
  </main>
</template>

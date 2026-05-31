<template>
    <a-config-provider :theme="{ token: { colorPrimary: '#8b5cf6' } }">
        <div style="background-color: #edf0f3;">
            <Header />
            <Navbar :categories="categories" />
            <Breadcrumb />
            <div class=" w-7xl mr-auto ml-auto">
                <router-view></router-view>
            </div>
            <<Footer />
        </div>
    </a-config-provider>
</template>

<script setup lang="ts">
import type { IGetCategoryResponse } from '@/api/models/category';
import { CategoryService } from '@/api/services/category';
import Footer from '@/components/Footer/Footer.vue';
import Header from '@/components/Header/Header.vue';
import Navbar from '@/components/Navbar/Navbar.vue';
import Breadcrumb from '@/components/common/breadcrumb/index.vue';
import { onMounted, ref } from 'vue';

const categories = ref<IGetCategoryResponse[]>([]);

const fetchCategories = async () => {
    const res = await CategoryService.getAllCategories();
    categories.value = res;
};

onMounted(() => {
    fetchCategories();
});
</script>

<style scoped></style>
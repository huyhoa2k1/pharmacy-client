<template>
    <a-layout style="min-height: 100vh">
        <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
            <div class="logo" style="height: 32px; margin: 16px; background: rgba(255, 255, 255, 0.3)"></div>
            <a-menu theme="dark" mode="inline" :default-selected-keys="['/admin/dashboard']">
                <a-menu-item key="/admin/products-management">
                    <i class="pi pi-box mr-2"></i>
                    <router-link to="/admin/products-management">Quản lý sản phẩm</router-link>
                </a-menu-item>
                <a-menu-item key="/admin/orders-management">
                    <i class="pi pi-shopping-cart mr-2"></i>
                    <router-link to="/admin/orders-management">Quản lý đơn hàng</router-link>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout>
            <a-layout-header style="background: #fff; padding: 0">
                <i v-if="collapsed" class="trigger pi pi-arrow-right ml-4" @click="() => (collapsed = !collapsed)" />
                <i v-else class="trigger pi pi-arrow-left ml-4" @click="() => (collapsed = !collapsed)" />
            </a-layout-header>
            <a-layout-content style="margin: 16px">
                <Breadcrumb />
                <div style="padding: 24px; margin-top: 16px; background: #fff">
                    <router-view></router-view>
                </div>
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>

<script setup lang="ts">
import Breadcrumb from '@/components/common/breadcrumb/index.vue'
import { ref } from 'vue'

const collapsed = ref<boolean>(false);
</script>

<style scoped></style>
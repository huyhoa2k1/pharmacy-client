<template>
    <a-layout style="min-height: 100vh">
        <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
            <div class="logo" style="height: 32px; margin: 16px; background: rgba(255, 255, 255, 0.3)"></div>
            <a-menu theme="dark" mode="inline" :default-selected-keys="['/admin/dashboard']">
                <a-sub-menu>
                    <template #title>
                        <AppstoreOutlined />
                        <span>Quản lý sản phẩm</span>
                    </template>
                    <a-menu-item key="/admin/products-management">
                        <router-link to="/admin/products-management">Danh sách sản phẩm</router-link>
                    </a-menu-item>
                    <a-menu-item key="/admin/categories-management">
                        <router-link to="/admin/categories-management">Categories</router-link>
                    </a-menu-item>
                    <a-menu-item key="/admin/brands-management">
                        <router-link to="/admin/brands-management">Brands</router-link>
                    </a-menu-item>
                </a-sub-menu>
                <a-menu-item key="/admin/orders-management">
                    <ShoppingCartOutlined />
                    <span><router-link to="/admin/orders-management">Quản lý đơn hàng</router-link></span>
                </a-menu-item>
                <a-sub-menu>
                    <template #title>
                        <SettingOutlined />
                        <span>Cài đặt</span>
                    </template>
                    <a-menu-item key="/admin/general-settings">
                        <router-link to="/admin/general-settings">Cài đặt chung</router-link>
                    </a-menu-item>
                </a-sub-menu>
            </a-menu>
        </a-layout-sider>
        <a-layout>
            <a-layout-header style="background: #fff; padding: 0">
                <div class="flex items-center justify-between pt-4">
                    <i v-if="collapsed" class="trigger pi pi-arrow-right ml-4"
                        @click="() => (collapsed = !collapsed)" />
                    <i v-else class="trigger pi pi-arrow-left ml-4" @click="() => (collapsed = !collapsed)" />
                    <div class="float-right mr-4 flex items-center gap-8 justify-center">
                        <BellOutlined class="text-2xl" />
                        <a-dropdown>
                            <a-avatar shape="square" size="32">
                                <template #icon>
                                    <UserOutlined />
                                </template>
                            </a-avatar>
                            <template #overlay>
                                <a-menu>
                                    <a-menu-item>
                                        <span>Đăng xuất</span>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                    </div>
                </div>
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
import { AppstoreOutlined, ShoppingCartOutlined, UserOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons-vue'

const collapsed = ref<boolean>(false);
</script>

<style scoped>
#components-layout-demo-custom-trigger .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
    color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.3);
    margin: 16px;
}

.site-layout .site-layout-background {
    background: #fff;
}
</style>
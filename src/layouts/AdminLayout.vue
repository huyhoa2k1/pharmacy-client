<template>
    <a-layout class="admin-layout">
        <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible class="admin-sider">
            <div class="admin-brand">
                <div class="admin-brand__mark" aria-hidden="true"></div>
                <div v-show="!collapsed" class="admin-brand__copy">
                    <span>Online Pharmacy</span>
                    <strong>Quản trị</strong>
                </div>
            </div>
            <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" theme="dark" mode="inline"
                class="admin-menu">
                <a-sub-menu key="catalog">
                    <template #title>
                        <AppstoreOutlined />
                        <span>Quản lý sản phẩm</span>
                    </template>
                    <a-menu-item key="/admin/products-management">
                        <router-link to="/admin/products-management">Danh sách sản phẩm</router-link>
                    </a-menu-item>
                    <a-menu-item key="/admin/categories-management">
                        <router-link to="/admin/categories-management">Danh mục</router-link>
                    </a-menu-item>
                    <a-menu-item key="/admin/brands-management">
                        <router-link to="/admin/brands-management">Thương hiệu</router-link>
                    </a-menu-item>
                </a-sub-menu>
                <a-menu-item key="/admin/orders-management">
                    <ShoppingCartOutlined />
                    <span><router-link to="/admin/orders-management">Quản lý đơn hàng</router-link></span>
                </a-menu-item>
                <a-sub-menu key="settings">
                    <template #title>
                        <SettingOutlined />
                        <span>Cài đặt</span>
                    </template>
                    <a-menu-item key="/admin/general-settings">
                        <router-link to="/admin/general-settings">Cài đặt chung</router-link>
                    </a-menu-item>
                    <a-menu-item key="/admin/province-ward-management">
                        <router-link to="/admin/province-ward-management">Tỉnh thành & phường xã</router-link>
                    </a-menu-item>
                </a-sub-menu>
            </a-menu>
        </a-layout-sider>
        <a-layout class="admin-main-layout">
            <a-layout-header class="admin-header">
                <div class="admin-header__left">
                    <a-button class="admin-header__control admin-header__desktop-control" type="text"
                        :aria-label="collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'"
                        :aria-expanded="!collapsed" @click="collapsed = !collapsed">
                        <template #icon>
                            <MenuUnfoldOutlined v-if="collapsed" />
                            <MenuFoldOutlined v-else />
                        </template>
                    </a-button>
                    <a-button class="admin-header__control admin-header__mobile-control" type="text"
                        aria-label="Mở thanh điều hướng" @click="mobileMenuOpen = true">
                        <template #icon>
                            <MenuOutlined />
                        </template>
                    </a-button>
                    <div>
                        <p class="admin-header__section">Quản trị nhà thuốc</p>
                        <span class="admin-header__title">{{ pageTitle }}</span>
                    </div>
                </div>
                <div class="admin-header__actions">
                    <div class="admin-header__notification">
                        <NotificationPopover />
                    </div>
                    <a-dropdown>
                        <a-button class="admin-user-trigger" type="text"
                            :aria-label="`Mở menu tài khoản${userStore.username ? ` của ${userStore.username}` : ''}`">
                            <a-avatar shape="square" :size="36" class="admin-user-trigger__avatar">
                                {{ userInitials }}
                            </a-avatar>

                            <DownOutlined class="admin-user-trigger__chevron" aria-hidden="true" />
                        </a-button>
                        <template #overlay>
                            <a-menu class="admin-user-menu">
                                <a-menu-item disabled class="admin-user-menu__summary">

                                </a-menu-item>
                                <a-menu-divider />
                                <a-menu-item>
                                    <span>Đăng xuất</span>
                                </a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                </div>
            </a-layout-header>
            <a-layout-content class="admin-content">
                <div class="admin-content__inner">
                    <Breadcrumb />
                    <AdminPageHeader v-if="showPageHeader" :title="pageTitle" :description="pageDescription" />
                    <main class="admin-page-surface">
                        <router-view />
                    </main>
                </div>
            </a-layout-content>
        </a-layout>
        <a-drawer v-model:open="mobileMenuOpen" placement="left" :width="288" class="admin-mobile-drawer"
            title="Online Pharmacy">
            <template #extra>
                <span class="admin-mobile-drawer__label">Quản trị</span>
            </template>
            <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" mode="inline"
                @click="mobileMenuOpen = false">
                <a-sub-menu key="catalog">
                    <template #title>
                        <AppstoreOutlined />
                        <span>Quản lý sản phẩm</span>
                    </template>
                    <a-menu-item key="/admin/products-management">
                        <router-link to="/admin/products-management">Danh sách sản phẩm</router-link>
                    </a-menu-item>
                    <a-menu-item key="/admin/categories-management">
                        <router-link to="/admin/categories-management">Danh mục</router-link>
                    </a-menu-item>
                    <a-menu-item key="/admin/brands-management">
                        <router-link to="/admin/brands-management">Thương hiệu</router-link>
                    </a-menu-item>
                </a-sub-menu>
                <a-menu-item key="/admin/orders-management">
                    <ShoppingCartOutlined />
                    <span><router-link to="/admin/orders-management">Quản lý đơn hàng</router-link></span>
                </a-menu-item>
                <a-sub-menu key="settings">
                    <template #title>
                        <SettingOutlined />
                        <span>Cài đặt</span>
                    </template>
                    <a-menu-item key="/admin/general-settings">
                        <router-link to="/admin/general-settings">Cài đặt chung</router-link>
                    </a-menu-item>
                    <a-menu-item key="/admin/province-ward-management">
                        <router-link to="/admin/province-ward-management">Tỉnh thành & phường xã</router-link>
                    </a-menu-item>
                </a-sub-menu>
            </a-menu>
        </a-drawer>
    </a-layout>
</template>

<script setup lang="ts">
import AdminPageHeader from '@/components/Admin/AdminPageHeader.vue'
import Breadcrumb from '@/components/common/breadcrumb/index.vue'
import NotificationPopover from '@/components/Notification/NotificationPopover.vue'
import { useUserStore } from '@/stores/user'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
    AppstoreOutlined,
    DownOutlined,
    MenuFoldOutlined,
    MenuOutlined,
    MenuUnfoldOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    SettingOutlined,
} from '@ant-design/icons-vue'

const route = useRoute()
const userStore = useUserStore()
const collapsed = ref<boolean>(false)
const mobileMenuOpen = ref(false)
const selectedKeys = ref<string[]>([route.path])
const openKeys = ref<string[]>([])

const pageDetails: Record<string, { title: string; description: string; hasOwnHeader?: boolean }> =
{
    'admin-products-management': {
        title: 'Quản lý sản phẩm',
        description: 'Theo dõi danh mục, giá bán, tồn kho và chương trình khuyến mãi.',
    },
    'admin-product-create': {
        title: 'Thêm sản phẩm',
        description: 'Tạo sản phẩm mới và thiết lập thông tin bán hàng.',
        hasOwnHeader: true,
    },
    'admin-categories-management': {
        title: 'Quản lý danh mục',
        description: 'Sắp xếp danh mục sản phẩm để khách hàng dễ tìm kiếm.',
    },
    'admin-brands-management': {
        title: 'Quản lý thương hiệu',
        description: 'Quản lý các thương hiệu và danh mục liên kết.',
    },
    'admin-orders-management': {
        title: 'Quản lý đơn hàng',
        description: 'Theo dõi thanh toán, xử lý và trạng thái giao hàng.',
    },
    'admin-general-settings': {
        title: 'Cài đặt chung',
        description: 'Quản lý hình ảnh thương hiệu và banner trang chủ.',
        hasOwnHeader: true,
    },
    'admin-province-ward-management': {
        title: 'Tỉnh thành & phường xã',
        description: 'Quản lý dữ liệu địa chỉ phục vụ giao hàng.',
        hasOwnHeader: true,
    },
}

const currentPageDetails = computed(
    () =>
        pageDetails[String(route.name)] ?? {
            title: String(route.meta.title ?? 'Quản trị'),
            description: '',
        },
)
const pageTitle = computed(() => currentPageDetails.value.title)
const pageDescription = computed(() => currentPageDetails.value.description)
const showPageHeader = computed(() => !currentPageDetails.value.hasOwnHeader)
const userInitials = computed(() => {
    const name = userStore.username.trim()
    return name ? name.slice(0, 2).toUpperCase() : 'AD'
})

watch(
    () => route.path,
    (path) => {
        selectedKeys.value = [path]
        openKeys.value =
            path.includes('products-management') ||
                path.includes('categories-management') ||
                path.includes('brands-management')
                ? ['catalog']
                : path.includes('settings') || path.includes('province-ward-management')
                    ? ['settings']
                    : []
        mobileMenuOpen.value = false
    },
    { immediate: true },
)
</script>

<style scoped>
.admin-layout {
    min-height: 100vh;
    background: var(--color-background);
}

.admin-sider {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: auto;
    background: #0f4c5c !important;
    box-shadow: 2px 0 16px rgba(15, 78, 92, 0.12);
}

.admin-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 80px;
    padding: 16px 20px;
    color: #fff;
}

.admin-brand__mark {
    display: grid;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    place-items: center;
    border-radius: 10px;
    background: var(--color-secondary);
    color: #0f172a;
    font-family: Figtree, Arial, sans-serif;
    font-weight: 700;
}

.admin-brand__copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    font-size: 0.75rem;
    line-height: 1.2;
    opacity: 0.82;
}

.admin-brand__copy strong {
    margin-top: 3px;
    font-family: Figtree, Arial, sans-serif;
    font-size: 1rem;
    font-weight: 700;
    opacity: 1;
}

.admin-menu {
    border-inline-end: 0;
    background: transparent;
}

.admin-menu :deep(.ant-menu-sub) {
    background: rgba(0, 0, 0, 0.08) !important;
}

.admin-menu :deep(.ant-menu-item a) {
    color: inherit;
    text-decoration: none;
}

.admin-main-layout {
    min-width: 0;
    background: transparent;
}

.admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    padding: 0 var(--space-xl);
    border-bottom: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.94);
    line-height: normal;
}

.admin-header__left,
.admin-header__actions {
    display: flex;
    align-items: center;
}

.admin-header__left {
    min-width: 0;
    gap: var(--space-md);
}

.admin-header__actions {
    gap: var(--space-sm);
}

.admin-header__control,
.admin-user-trigger {
    display: inline-grid;
    width: 44px;
    height: 44px;
    place-items: center;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    color: var(--color-foreground);
}

.admin-header__control:hover,
.admin-user-trigger:hover {
    border-color: var(--color-border);
    background: var(--color-muted);
}

.admin-user-trigger {
    width: auto;
    min-width: 44px;
    gap: var(--space-sm);
    padding: 4px 8px 4px 4px;
}

.admin-user-trigger__avatar {
    background: var(--color-primary);
    color: var(--color-on-primary);
    font-size: 0.75rem;
    font-weight: 700;
}

.admin-user-trigger__details {
    display: grid;
    min-width: 0;
    text-align: left;
}

.admin-user-trigger__details strong,
.admin-user-trigger__details small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.admin-user-trigger__details strong {
    max-width: 160px;
    color: var(--color-foreground);
    font-size: 0.8125rem;
    line-height: 1.2;
}

.admin-user-trigger__details small {
    max-width: 160px;
    margin-top: 2px;
    color: var(--color-muted-foreground);
    font-size: 0.6875rem;
    line-height: 1.2;
}

.admin-user-trigger__chevron {
    color: var(--color-muted-foreground);
    font-size: 0.625rem;
}

.admin-user-menu :deep(.admin-user-menu__summary) {
    display: grid;
    min-width: 200px;
    height: auto;
    padding: 8px 12px;
    cursor: default;
}

.admin-user-menu :deep(.admin-user-menu__summary.ant-dropdown-menu-item-disabled) {
    color: var(--color-foreground);
}

.admin-user-menu :deep(.admin-user-menu__summary span) {
    margin-top: 2px;
    color: var(--color-muted-foreground);
    font-size: 0.75rem;
}

.admin-header__mobile-control {
    display: none;
}

.admin-header__section {
    margin: 0 0 3px;
    color: var(--color-muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.2;
}

.admin-header__title {
    display: block;
    overflow: hidden;
    color: var(--color-foreground);
    font-family: Figtree, Arial, sans-serif;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.admin-content {
    padding: var(--space-lg);
    background: var(--color-background);
}

.admin-content__inner {
    width: min(100%, 1440px);
    margin: 0 auto;
}

.admin-page-surface {
    min-width: 0;
    padding: var(--space-xl);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    background: var(--color-card);
    box-shadow: var(--shadow-sm);
}

.admin-mobile-drawer__label {
    color: var(--color-muted-foreground);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

@media (max-width: 991px) {
    .admin-sider {
        display: none;
    }

    .admin-header__desktop-control {
        display: none;
    }

    .admin-header__mobile-control {
        display: inline-grid;
    }
}

@media (max-width: 640px) {
    .admin-header {
        height: 72px;
        padding: 0 var(--space-md);
    }

    .admin-content {
        padding: var(--space-md);
    }

    .admin-page-surface {
        padding: var(--space-lg);
        border-radius: 0 0 var(--radius-md) var(--radius-md);
    }

    .admin-header__notification {
        display: none;
    }

    .admin-user-trigger {
        padding: 4px;
    }

    .admin-user-trigger__details,
    .admin-user-trigger__chevron {
        display: none;
    }
}
</style>

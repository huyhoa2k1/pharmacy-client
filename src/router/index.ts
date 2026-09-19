import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DetailLayout from '@/layouts/DetailLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { loadLayoutMiddleware } from './middleware'
import NoneLayout from '@/layouts/NoneLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { handlePermissions } from '@/middlewares/permission'
import i18n from '@/i18n'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        layout: AppLayout,
        titleKey: 'routeTitles.home',
      },
    },
    {
      path: '/:categoryId/products',
      name: 'products',
      component: () => import('../views/Products/ProductsView.vue'),
      meta: {
        layout: DetailLayout,
        titleKey: 'routeTitles.products',
      },
    },
    {
      path: '/:categoryId/products/:id',
      name: 'product-detail',
      component: () => import('@/views/Products/_id/ProductView.vue'),
      meta: {
        layout: DetailLayout,
        titleKey: 'routeTitles.productDetail',
      },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/Cart/CartView.vue'),
      meta: {
        layout: DetailLayout,
        titleKey: 'routeTitles.cart',
      },
    },
    {
      path: '/check-out',
      name: 'checkout',
      component: () => import('@/views/Checkout/CheckoutView.vue'),
      meta: {
        layout: DetailLayout,
        titleKey: 'routeTitles.checkout',
      },
    },
    {
      path: '/best-sellers',
      name: 'best-sellers',
      component: () => import('@/views/BestSellersView.vue'),
      meta: {
        layout: DetailLayout,
        titleKey: 'routeTitles.bestSellers',
      },
    },
    {
      path: '/ca-nhan',
      name: 'personal-info',
      component: () => import('@/views/Personal/index.vue'),
      children: [
        {
          path: 'thong-tin',
          name: 'personal-info-detail',
          component: () => import('@/views/Personal/Information/index.vue'),
          meta: {
            layout: DetailLayout,
            titleKey: 'routeTitles.personalInfo',
          },
        },
        {
          path: 'don-hang',
          name: 'personal-orders',
          component: () => import('@/views/Personal/MyOrder/index.vue'),
          meta: {
            layout: DetailLayout,
            titleKey: 'routeTitles.personalOrders',
          },
        },
      ],
    },

    // Admin routes
    {
      path: '/admin/products-management',
      name: 'admin-products-management',
      component: () => import('@/views/Admin/ProductManagement/index.vue'),
      meta: {
        layout: AdminLayout,
        titleKey: 'adminLayout.productsPageTitle',
        roles: [],
      },
    },
    {
      path: '/admin/products-management/create',
      name: 'admin-product-create',
      component: () => import('@/views/Admin/ProductManagement/create/product/index.vue'),
      meta: {
        layout: AdminLayout,
        titleKey: 'adminLayout.productCreatePageTitle',
        roles: [],
      },
    },
    {
      path: '/admin/categories-management',
      name: 'admin-categories-management',
      component: () => import('@/views/Admin/CategoryManagement/index.vue'),
      meta: {
        layout: AdminLayout,
        titleKey: 'adminLayout.categoriesPageTitle',
        roles: [],
      },
    },
    {
      path: '/admin/brands-management',
      name: 'admin-brands-management',
      component: () => import('@/views/Admin/BrandManagement/index.vue'),
      meta: {
        layout: AdminLayout,
        titleKey: 'adminLayout.brandsPageTitle',
        roles: [],
      },
    },
    {
      path: '/admin/orders-management',
      name: 'admin-orders-management',
      component: () => import('@/views/Admin/OrderManagement/index.vue'),
      meta: {
        layout: AdminLayout,
        titleKey: 'adminLayout.ordersPageTitle',
        roles: [],
      },
    },
    {
      path: '/admin/general-settings',
      name: 'admin-general-settings',
      component: () => import('@/views/Admin/Setting/General/index.vue'),
      meta: {
        layout: AdminLayout,
        titleKey: 'adminLayout.generalSettingsPageTitle',
        roles: [],
      },
    },
    {
      path: '/admin/province-ward-management',
      name: 'admin-province-ward-management',
      component: () => import('@/views/Admin/Setting/Province/index.vue'),
      meta: {
        layout: AdminLayout,
        titleKey: 'adminLayout.provincePageTitle',
        roles: [],
      },
    },
    {
      path: '/error',
      name: 'Error',
      component: () => import('@/views/Error/ErrorView.vue'),
      meta: {
        layout: NoneLayout,
        titleKey: 'routeTitles.error',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/error?status_code=404',
    },
  ],
})

router.beforeEach(handlePermissions)
router.beforeEach(loadLayoutMiddleware)
router.beforeEach((to, from, next) => {
  const titleKey = to.meta.titleKey as string | undefined
  document.title = titleKey ? i18n.global.t(titleKey) : (to.meta.title as string) || 'Default Title'
  next()
})

export default router

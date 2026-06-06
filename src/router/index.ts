import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DetailLayout from '@/layouts/DetailLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { loadLayoutMiddleware } from './middleware'
import NoneLayout from '@/layouts/NoneLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        layout: AppLayout,
        title: 'Pharmacy Management System',
      },
    },
    {
      path: '/:categoryId/products',
      name: 'products',
      component: () => import('../views/Products/ProductsView.vue'),
      meta: {
        layout: DetailLayout,
        title: 'Danh sách sản phẩm - Pharmacy Management System',
      },
    },
    {
      path: '/:categoryId/products/:id',
      name: 'product-detail',
      component: () => import('@/views/Products/_id/ProductView.vue'),
      meta: {
        layout: DetailLayout,
        title: 'Chi tiết',
      },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/Cart/CartView.vue'),
      meta: {
        layout: DetailLayout,
        title: 'Giỏ hàng',
      },
    },
    {
      path: '/check-out',
      name: 'checkout',
      component: () => import('@/views/Checkout/CheckoutView.vue'),
      meta: {
        layout: DetailLayout,
        title: 'Thanh toán',
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
            title: 'Thông tin cá nhân',
          },
        },
        {
          path: 'don-hang',
          name: 'personal-orders',
          component: () => import('@/views/Personal/MyOrder/index.vue'),
          meta: {
            layout: DetailLayout,
            title: 'Đơn hàng của tôi',
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
        title: 'Quản lý sản phẩm',
      },
    },
    {
      path: '/admin/products-management/create',
      name: 'admin-product-create',
      component: () => import('@/views/Admin/ProductManagement/create/product/index.vue'),
      meta: {
        layout: AdminLayout,
        title: 'Thêm sản phẩm',
      },
    },
    {
      path: '/admin/orders-management',
      name: 'admin-orders-management',
      component: () => import('@/views/Admin/OrderManagement/index.vue'),
      meta: {
        layout: AdminLayout,
        title: 'Quản lý đơn hàng',
      },
    },
    {
      path: '/error',
      name: 'Error',
      component: () => import('@/views/Error/ErrorView.vue'),
      meta: {
        layout: NoneLayout,
        title: 'Error',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/error?status_code=404',
    },
  ],
})

router.beforeEach(loadLayoutMiddleware)
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Default Title'
  next()
})

export default router

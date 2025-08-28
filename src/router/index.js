import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMaintenanceStore } from '../stores/maintenance'

const routes = [
  {
    path: '/maintenance-page',
    name: 'MaintenancePage',
    component: () => import('../views/MaintenancePage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/member/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/member/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/member/ForgotPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/member/ResetPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/member/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-products',
    name: 'MyProducts',
    component: () => import('../views/member/MyProducts.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/product/Products.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('../views/product/ProductDetail.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/add-product',
    name: 'AddProduct',
    component: () => import('../views/product/AddProduct.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-product/:id',
    name: 'EditProduct',
    component: () => import('../views/product/EditProduct.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/system/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('../views/system/Maintenance.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/icon-demo',
    name: 'IconDemo',
    component: () => import('../views/system/IconDemo.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: () => import('../views/AccessDenied.vue'),
    meta: { requiresAuth: false }
  },
  // 404 頁面 - 必須放在最後，捕獲所有不匹配的路徑
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const maintenanceStore = useMaintenanceStore()
  const skipMaintenanceCheck = ['MaintenancePage', 'Admin', 'Maintenance', 'NotFound']
  
  // 如果目標是維護頁面或404頁面，直接允許
  if (to.name === 'MaintenancePage' || to.name === 'NotFound') {
    return next()
  }
  
  try {
    // 如果維護模式已啟用，重定向到維護頁面
    if (maintenanceStore.maintenanceMode.value && !skipMaintenanceCheck.includes(to.name)) {
      return next('/maintenance-page')
    }
  } catch (error) {
    console.error('檢查維護狀態失敗:', error)
    // 如果檢查失敗，繼續正常流程
  }
  
  // 正常的權限檢查
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router

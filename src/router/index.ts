import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import store from '../store';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/auth/LoginPage.vue';

const ProductsPage = () =>
  import('../views/catalog/ProductsPage.vue');
const ProductDetailPage = () =>
  import('../views/catalog/ProductDetailPage.vue');
const CartPage = () => import('../views/cart/CartPage.vue');
const RegisterPage = () => import('../views/auth/RegisterPage.vue');
const CheckoutSuccessPage = () =>
  import('../views/orders/CheckoutSuccessPage.vue');
const AdminProductsPage = () =>
  import('../views/admin/AdminProductsPage.vue');
const AdminUsersPage = () =>
  import('../views/admin/AdminUsersPage.vue');
const AccountPage = () => import('../views/user/AccountPage.vue');
const NotificationsPage = () => import('../views/user/NotificationsPage.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationsPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/account',
    name: 'account',
    component: AccountPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: ProductsPage,
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: ProductDetailPage,
    props: true,
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartPage,
    meta: {
      customerOnly: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: {
      public: true,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: {
      public: true,
    },
  },
  {
    path: '/checkout/success',
    name: 'checkout-success',
    component: CheckoutSuccessPage,
    meta: {
      customerOnly: true,
    },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: AdminProductsPage,
    meta: {
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsersPage,
    meta: {
      requiresAdmin: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const isAuthenticated = () => {
  return store.getters.authenticated && store.getters.user !== null;
};

const canAccessAdmin = () => {
  const user = store.getters.user;
  return user && user.is_superadmin === '1';
};

const globalGuard = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  // Allow access to public routes (login, register)
  if (to.meta?.public) {
    return next();
  }

  // Check if user is authenticated for all other routes
  if (!isAuthenticated()) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  // Check if route is customer-only and user is admin
  if (to.meta?.customerOnly && canAccessAdmin()) {
    return next({ name: 'admin-products' });
  }

  // Check if route requires admin access
  if (to.meta?.requiresAdmin && !canAccessAdmin()) {
    return next({ name: 'home' });
  }

  return next();
};

router.beforeEach(globalGuard);

export default router;

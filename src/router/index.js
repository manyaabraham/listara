import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/register', component: () => import('../views/Register.vue') },
  { path: '/dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/kitchen', component: () => import('../views/Kitchen.vue'), meta: { requiresAuth: true } },
  { path: '/shopping', component: () => import('../views/Shopping.vue'), meta: { requiresAuth: true } },
  { path: '/recipes', component: () => import('../views/Recipes.vue'), meta: { requiresAuth: true } },
  { path: '/reports', component: () => import('../views/Reports.vue'), meta: { requiresAuth: true } },
  { path: '/profile', component: () => import('../views/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/settings', component: () => import('../views/Settings.vue'), meta: { requiresAuth: true } },
  { path: '/ai-assistant', component: () => import('../views/AIAssistant.vue'), meta: { requiresAuth: true } },
  { path: '/inventory-analytics', component: () => import('../views/InventoryAnalytics.vue'), meta: { requiresAuth: true } },
 { path: '/recipe-search', component: () => import('../views/RecipeSearch.vue'), meta: { requiresAuth: true } },
{ path: '/recipe-downloads', component: () => import('../views/RecipeDownloads.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  await authStore.loadUser()
  
  if (to.meta.requiresAuth && !authStore.user) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && authStore.user) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
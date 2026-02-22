import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue')
  }
  ,{
    path: '/prayers',
    name: 'prayers',
    component: () => import('@/views/PrayersView.vue')
  }
]

const router = createRouter({
  // FIX: Change process.env.BASE_URL to import.meta.env.BASE_URL
  history: createWebHistory(import.meta.env.BASE_URL), 
  routes
})

export default router
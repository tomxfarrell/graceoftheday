import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/past',
    name: 'past',
    component: () => import('@/views/PastReadingsView.vue'),
  },
  {
    // A past day's reading, in the same layout as today's
    path: '/day/:date(\\d{4}-\\d{2}-\\d{2})',
    name: 'day',
    component: () => import('@/views/HomeView.vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

export default router;

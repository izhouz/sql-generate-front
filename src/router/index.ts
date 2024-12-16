import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/layouts/default/index.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/home/index.vue')
        },
        {
          path: 'table-designer',
          name: 'TableDesigner',
          component: () => import('@/views/table-designer/index.vue')
        },
        {
          path: 'sql-generator',
          name: 'SqlGenerator',
          component: () => import('@/views/sql-generator/index.vue')
        },
        {
          path: 'mock-data',
          name: 'MockData',
          component: () => import('@/views/mock-data/index.vue')
        },
        {
          path: 'report',
          name: 'Report',
          component: () => import('@/views/report/index.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/error/404.vue')
    }
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  
  if (requiresAuth && !isAuthenticated()) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router

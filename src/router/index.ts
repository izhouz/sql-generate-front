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
          redirect: '/home'
        },
        {
          path: 'home',
          name: 'Home',
          component: () => import('@/views/home/index.vue'),
          meta: { title: '首页', icon: 'House' }
        },
        {
          path: 'table-designer',
          name: 'TableDesigner',
          component: () => import('@/views/table-designer/index.vue'),
          meta: { title: '表设计器', icon: 'Grid' }
        },
        {
          path: 'sql-generator',
          name: 'SqlGenerator',
          component: () => import('@/views/sql-generator/index.vue'),
          meta: { title: 'SQL生成', icon: 'Document' }
        },
        {
          path: 'mock-data',
          name: 'MockData',
          component: () => import('@/views/mock-data/index.vue'),
          meta: { title: '模拟数据', icon: 'Grid' }
        },
        {
          path: 'report',
          name: 'Report',
          component: () => import('@/views/report/index.vue'),
          meta: { title: '报告管理', icon: 'Document' }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/settings/index.vue'),
          meta: { title: '系统设置', icon: 'Setting' }
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
  
  // 设置页面标题
  const title = to.meta.title ? `${to.meta.title} - SQL生成器` : 'SQL生成器'
  document.title = title
  
  if (requiresAuth && !isAuthenticated()) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router

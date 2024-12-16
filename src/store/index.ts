import { createPinia } from 'pinia'
import type { App } from 'vue'

const store = createPinia()

// 配置 store
export function setupStore(app: App<Element>) {
  app.use(store)
}

export { store }

// 统一导出模块
export * from './modules/user'
export * from './modules/dict'
export * from './modules/fieldInfo'
export * from './modules/tableInfo'
export * from './modules/report'

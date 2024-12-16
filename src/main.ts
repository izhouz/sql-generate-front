import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupStore, useSettingsStore } from './store'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Global styles
import './styles/index.scss'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置插件
setupStore(app)

// 初始化设置
const settingsStore = useSettingsStore()
settingsStore.initSettings()

app.use(router)
app.use(ElementPlus)

app.mount('#app')

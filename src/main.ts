import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupStore } from './store'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Formily
import { setupFormily } from './plugins/formily'

// Global styles
import './styles/index.scss'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置插件
setupStore(app)
setupFormily(app)

app.use(router)
app.use(ElementPlus)

app.mount('#app')

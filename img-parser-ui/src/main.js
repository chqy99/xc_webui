// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'

// 创建 Vue 应用实例
const app = createApp(App)

// 使用 Pinia
app.use(createPinia())

// 使用 Element Plus
app.use(ElementPlus)

// 挂载应用
app.mount('#app')

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

// 設定 axios 基礎 URL
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL
  console.log('🌐 API 基礎 URL 已設定:', import.meta.env.VITE_API_URL)
} else {
  console.warn('⚠️  VITE_API_URL 環境變數未設定，使用相對路徑')
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化維護狀態檢查
const maintenanceStore = useMaintenanceStore()
const authStore = useAuthStore()

authStore.fetchUser()
maintenanceStore.fetchMaintenanceStatus()

app.mount('#app')

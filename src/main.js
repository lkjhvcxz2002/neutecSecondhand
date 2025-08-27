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

// 設定 axios 超時和錯誤處理
axios.defaults.timeout = 15000 // 15秒超時
axios.defaults.retry = 1 // 重試次數
axios.defaults.retryDelay = 1000 // 重試延遲

// 請求攔截器
axios.interceptors.request.use(
  (config) => {
    // console.log(`🚀 發送請求: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ 請求錯誤:', error)
    return Promise.reject(error)
  }
)

// 回應攔截器
axios.interceptors.response.use(
  (response) => {
    // console.log(`✅ 請求成功: ${response.config.method?.toUpperCase()} ${response.config.url}`)
    return response
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ 請求超時:', error.config.url)
    } else if (error.response) {
      console.error('❌ 回應錯誤:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('❌ 網路錯誤:', error.message)
    }
    return Promise.reject(error)
  }
)

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

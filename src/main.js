import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化維護狀態檢查
const maintenanceStore = useMaintenanceStore()
const authStore = useAuthStore()

await authStore.fetchUser()
await maintenanceStore.fetchMaintenanceStatus()

app.mount('#app')

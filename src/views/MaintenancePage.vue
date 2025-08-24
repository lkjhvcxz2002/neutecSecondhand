<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- 維護圖示 -->
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center">
          <Icon name="wrench-screwdriver" class="w-12 h-12 text-white" />
        </div>
      </div>
      
      <!-- 標題 -->
      <h1 class="text-3xl font-bold text-white mb-4">
        系統維護中
      </h1>
      
      <!-- 描述 -->
      <p class="text-gray-300 text-lg mb-8">
        我們正在進行系統維護，以提供更好的服務體驗。<br>
        請稍後再試，感謝您的耐心等待。
      </p>
      
      <!-- 進度條 -->
      <div class="mb-8">
        <div class="w-full bg-gray-700 rounded-full h-2">
          <div class="bg-yellow-500 h-2 rounded-full animate-pulse" style="width: 60%"></div>
        </div>
        <p class="text-gray-400 text-sm mt-2">維護進度：60%</p>
      </div>
      
      <!-- 預計完成時間 -->
      <div class="bg-gray-800 rounded-lg p-4 mb-8">
        <p class="text-gray-300 text-sm">
          預計完成時間：<span class="text-yellow-400 font-medium">2小時內</span>
        </p>
      </div>
      
      <!-- 聯繫方式 -->
      <div class="text-gray-400 text-sm">
        <p>如有緊急問題，請聯繫管理員</p>
        <p class="mt-2">
          <a 
            href="https://t.me/ParkerDuTW" 
            target="_blank"
            class="text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            @ParkerDuTW
          </a>
        </p>
      </div>
      
      <!-- 自動刷新提示 -->
      <div class="mt-8 text-gray-500 text-xs">
        <p>頁面將自動檢查維護狀態</p>
        <p>倒數計時：{{ countdown }}秒</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMaintenanceStore } from '@/stores/maintenance'
import Icon from '@/components/Icon.vue'

const router = useRouter()
const maintenanceStore = useMaintenanceStore()
const countdown = ref(30)
let countdownTimer = null
let checkTimer = null

// 檢查維護狀態
const checkMaintenanceStatus = async () => {
  try {
    await maintenanceStore.fetchMaintenanceStatus()
    
    // 如果維護模式已關閉，重定向到首頁
    if (!maintenanceStore.maintenanceMode) {
      router.push('/')
    }
  } catch (error) {
    console.error('檢查維護狀態失敗:', error)
  }
}

// 倒數計時
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      countdown.value = 30
      checkMaintenanceStatus()
    }
  }, 1000)
}

// 定期檢查維護狀態
const startPeriodicCheck = () => {
  checkTimer = setInterval(() => {
    checkMaintenanceStatus()
  }, 30000) // 每30秒檢查一次
}

onMounted(() => {
  startCountdown()
  startPeriodicCheck()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  if (checkTimer) {
    clearInterval(checkTimer)
  }
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>

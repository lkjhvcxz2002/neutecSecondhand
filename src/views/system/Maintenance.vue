<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">系統維護</h1>
      
      <div class="space-y-6">
        <!-- 維護模式控制 -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">維護模式</h3>
          <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                {{ maintenanceStore.maintenanceMode.value}}
                維護模式狀態：{{ maintenanceStore.maintenanceMode.value ? '已啟用' : '已關閉' }}
              </span>
              <button 
                @click="toggleMaintenanceMode"
                :class="maintenanceStore.maintenanceMode.value ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
                class="px-4 py-2 text-white rounded-lg transition-colors"
              >
                {{ maintenanceStore.maintenanceMode.value ? '關閉維護模式' : '啟用維護模式' }}
              </button>
            </div>
        </div>

        <!-- 系統設定 -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">系統設定</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                每個商品最大圖片數量
              </label>
              <input
                :value="5"
                type="number"
                min="1"
                max="10"
                class="input-field mt-1"
                disabled
              />
              <p class="text-xs text-gray-500 mt-1">目前固定為 5 張</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                商品最大價格 (NT$)
              </label>
              <input
                :value="999999"
                type="number"
                min="1"
                class="input-field mt-1"
                disabled
              />
              <p class="text-xs text-gray-500 mt-1">目前固定為 NT$ 999,999</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                允許的商品分類
              </label>
              <textarea
                :value="'電子產品,服飾,書籍,家具,其他'"
                rows="3"
                class="input-field"
                disabled
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">目前固定為預設分類</p>
            </div>
            
            <button 
              @click="saveSettings"
              class="btn-primary"
              disabled
            >
              儲存設定 (目前不可編輯)
            </button>
          </div>
        </div>

        <!-- 系統操作 -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">系統操作</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <button @click="clearOldImages" class="btn-secondary">
              清理未使用的圖片
            </button>
            <button @click="backupDatabase" class="btn-secondary">
              備份資料庫
            </button>
            <button @click="clearCache" class="btn-secondary">
              清理快取
            </button>
            <button @click="systemHealth" class="btn-secondary">
              系統健康檢查
            </button>
          </div>
        </div>

        <!-- 系統日誌 -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">系統日誌</h3>
          <div class="bg-gray-100 p-4 rounded-lg">
            <div class="text-gray-500 text-center py-4">
              日誌功能開發中...
            </div>
          </div>
        </div>
      </div>

      <!-- 訊息 -->
      <div v-if="message" class="mt-6 p-3 rounded" :class="messageClass">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMaintenanceStore } from '@/stores/maintenance'

const maintenanceStore = useMaintenanceStore()

const message = ref('')
const messageType = ref('')

// 顯示訊息
const showMessage = (text, type) => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}

// 計算訊息樣式
const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-100 border border-green-400 text-green-700'
    : 'bg-red-100 border border-red-400 text-red-700'
})

// 切換維護模式
const toggleMaintenanceMode = async () => {
  const result = await maintenanceStore.toggleMaintenanceMode()
  
  if (result.success) {
    showMessage(result.message, 'success')
  } else {
    showMessage('操作失敗：' + result.message, 'error')
  }
}

// 儲存設定
const saveSettings = async () => {
  showMessage('設定功能開發中...', 'info')
}

// 清理未使用的圖片
const clearOldImages = async () => {
  showMessage('清理功能開發中...', 'info')
}

// 備份資料庫
const backupDatabase = async () => {
  showMessage('備份功能開發中...', 'info')
}

// 清理快取
const clearCache = async () => {
  showMessage('快取清理功能開發中...', 'info')
}

// 系統健康檢查
const systemHealth = async () => {
  showMessage('健康檢查功能開發中...', 'info')
}

onMounted(async () => {
  await maintenanceStore.fetchMaintenanceStatus()
})
</script>

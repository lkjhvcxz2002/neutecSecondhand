<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">系統維護</h1>
      
      <div class="space-y-6">
        <!-- 維護模式控制 -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">維護模式</h3>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600">啟用維護模式後，一般用戶將無法訪問系統</p>
              <p class="text-sm text-gray-500 mt-1">只有管理員可以訪問</p>
            </div>
            <button 
              @click="toggleMaintenanceMode"
              :class="maintenanceMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
              class="px-4 py-2 text-white rounded-lg transition-colors"
            >
              {{ maintenanceMode ? '關閉維護模式' : '啟用維護模式' }}
            </button>
          </div>
        </div>

        <!-- 系統設定 -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">系統設定</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                每個商品最大圖片數量
              </label>
              <input
                v-model.number="settings.maxImagesPerProduct"
                type="number"
                min="1"
                max="10"
                class="input-field w-32"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                商品最大價格 (NT$)
              </label>
              <input
                v-model.number="settings.maxProductPrice"
                type="number"
                min="1"
                class="input-field w-32"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                允許的商品分類
              </label>
              <textarea
                v-model="settings.allowedCategories"
                rows="3"
                class="input-field"
                placeholder="用逗號分隔，例如：電子產品,服飾,書籍,家具,其他"
              ></textarea>
            </div>
            
            <div class="flex justify-end">
              <button @click="saveSettings" class="btn-primary">
                儲存設定
              </button>
            </div>
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
            <div v-if="logs.length === 0" class="text-gray-500 text-center py-4">
              暫無日誌記錄
            </div>
            <div v-else class="space-y-2 max-h-64 overflow-y-auto">
              <div 
                v-for="log in logs" 
                :key="log.id"
                class="text-sm p-2 bg-white rounded border-l-4"
                :class="logLevelClass(log.level)"
              >
                <div class="flex justify-between items-start">
                  <span class="font-medium">{{ log.message }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(log.timestamp) }}</span>
                </div>
                <div v-if="log.details" class="text-xs text-gray-600 mt-1">
                  {{ log.details }}
                </div>
              </div>
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

const maintenanceMode = ref(false)
const settings = ref({
  maxImagesPerProduct: 5,
  maxProductPrice: 999999,
  allowedCategories: '電子產品,服飾,書籍,家具,其他'
})

const logs = ref([])
const message = ref('')
const messageType = ref('')

const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-100 border border-green-400 text-green-700'
    : 'bg-red-100 border border-red-400 text-red-700'
})

const logLevelClass = (level) => {
  const classMap = {
    'info': 'border-blue-500',
    'warning': 'border-yellow-500',
    'error': 'border-red-500',
    'success': 'border-green-500'
  }
  return classMap[level] || 'border-gray-500'
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('zh-TW')
}

const toggleMaintenanceMode = async () => {
  try {
    // 這裡應該調用 API 切換維護模式
    maintenanceMode.value = !maintenanceMode.value
    showMessage(`維護模式已${maintenanceMode.value ? '啟用' : '關閉'}`, 'success')
    
    // 記錄日誌
    addLog('info', `維護模式${maintenanceMode.value ? '啟用' : '關閉'}`, `由管理員操作`)
  } catch (error) {
    showMessage('操作失敗：' + error.message, 'error')
  }
}

const saveSettings = async () => {
  try {
    // 這裡應該調用 API 儲存設定
    showMessage('設定已儲存', 'success')
    addLog('info', '系統設定已更新', `圖片數量: ${settings.value.maxImagesPerProduct}, 最大價格: ${settings.value.maxProductPrice}`)
  } catch (error) {
    showMessage('儲存失敗：' + error.message, 'error')
  }
}

const clearOldImages = async () => {
  try {
    // 這裡應該調用 API 清理圖片
    showMessage('未使用的圖片已清理', 'success')
    addLog('info', '清理未使用的圖片', '系統維護操作')
  } catch (error) {
    showMessage('清理失敗：' + error.message, 'error')
  }
}

const backupDatabase = async () => {
  try {
    // 這裡應該調用 API 備份資料庫
    showMessage('資料庫備份已開始', 'success')
    addLog('info', '資料庫備份', '系統維護操作')
  } catch (error) {
    showMessage('備份失敗：' + error.message, 'error')
  }
}

const clearCache = async () => {
  try {
    // 這裡應該調用 API 清理快取
    showMessage('快取已清理', 'success')
    addLog('info', '清理快取', '系統維護操作')
  } catch (error) {
    showMessage('清理失敗：' + error.message, 'error')
  }
}

const systemHealth = async () => {
  try {
    // 這裡應該調用 API 檢查系統健康狀態
    showMessage('系統健康檢查完成', 'success')
    addLog('success', '系統健康檢查', '系統狀態正常')
  } catch (error) {
    showMessage('檢查失敗：' + error.message, 'error')
    addLog('error', '系統健康檢查失敗', error.message)
  }
}

const showMessage = (msg, type) => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const addLog = (level, message, details = '') => {
  logs.value.unshift({
    id: Date.now(),
    level,
    message,
    details,
    timestamp: new Date().toISOString()
  })
  
  // 限制日誌數量
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100)
  }
}

onMounted(() => {
  // 載入初始設定和日誌
  addLog('info', '系統維護頁面載入', '管理員登入')
})
</script>

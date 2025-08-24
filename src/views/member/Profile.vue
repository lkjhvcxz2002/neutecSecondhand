<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">個人資料</h1>
        
        <div class="card">
          <form @submit.prevent="handleUpdateProfile" class="space-y-6">
            <div class="flex items-center space-x-6">
              <div class="w-24 h-24">
                <img 
                  v-if="form.avatarPreview || authStore.user?.avatar" 
                  :src="form.avatarPreview || authStore.user?.avatar" 
                  alt="頭像"
                  class="w-24 h-24 rounded-full object-cover"
                />
                <div v-else class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">更新頭像</label>
                <input 
                  type="file" 
                  @change="handleAvatarChange"
                  accept="image/*"
                  class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>

            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">
                姓名
                <span class="text-xs text-gray-500 ml-2">
                  ({{ form.name.length }}/20)
                </span>
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                maxlength="20"
                class="input-field mt-1"
                :class="{ 'border-red-500': nameError }"
                placeholder="請輸入您的姓名"
                @input="validateName"
                @blur="validateName"
              />
              <div v-if="nameError" class="text-xs text-red-500 mt-1">
                {{ nameError }}
              </div>
              <div v-else class="text-xs text-gray-500 mt-1">
                剩餘 {{ 20 - form.name.length }} 字
              </div>
            </div>

            <div>
              <label for="telegram" class="block text-sm font-medium text-gray-700 flex justify-between">
                <span>Telegram 聯絡方式</span>
                <Tooltip 
                  text="如何找到您的Telegram帳號：&#10;1. 打開Telegram應用&#10;2. 點擊左上角選單&#10;3. 查看您的用戶名（@username）&#10;4. 或者點擊您的頭像查看完整資料"
                  position="top"
                >
                  <span class="text-xs text-gray-500 cursor-help">
                    <Icon name="information-circle" class="w-4 h-4" />
                  </span>
                </Tooltip>
              </label>
              <input
                id="telegram"
                v-model="form.telegram"
                type="text"
                maxlength="32"
                class="input-field mt-1"
                :class="{ 'border-red-500': telegramError }"
                placeholder="請輸入您的 Telegram 帳號（例如：username）"
                @input="validateTelegram"
                @blur="validateTelegram"
              />
              <div v-if="telegramError" class="text-xs text-red-500 mt-1">
                {{ telegramError }}
              </div>
              <div v-else-if="form.telegram" class="text-xs text-gray-500 mt-1">
                剩餘 {{ 32 - form.telegram.length }} 字
              </div>
              <div v-else class="text-xs text-gray-500 mt-1">
                Telegram 帳號為選填項目
              </div>
            </div>

            <div class="flex space-x-3">
              <button
                type="button"
                @click="resetForm"
                :disabled="loading"
                class="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                重置
              </button>
              
              <button
                type="submit"
                :disabled="loading || !isFormValid"
                class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading">更新中...</span>
                <span v-else>更新資料</span>
              </button>
            </div>
          </form>

          <!-- 訊息 -->
          <div v-if="message" class="mt-4 p-3 rounded" :class="messageClass">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Tooltip from '@/components/Tooltip.vue'
import Icon from '@/components/Icon.vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  name: '',
  telegram: '',
  avatar: null,
  avatarPreview: null
})

const message = ref('')
const messageType = ref('')
const loading = ref(false)

const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-100 border border-green-400 text-green-700'
    : 'bg-red-100 border border-red-400 text-red-700'
})

const nameError = ref('')
const telegramError = ref('')

const validateName = () => {
  if (!form.value.name) {
    nameError.value = '姓名不能為空'
  } else if (form.value.name.length > 20) {
    nameError.value = '姓名不能超過 20 個字'
  } else {
    nameError.value = ''
  }
}

const validateTelegram = () => {
  if(!form.value.telegram) {
    telegramError.value = 'Telegram 帳號不能為空'
  } else if(form.value.telegram.length > 32) {
    telegramError.value = 'Telegram 帳號不能超過 32 個字'
  } else {
    telegramError.value = ''
  }

  if(form.value.telegram.includes('@')) {
    form.value.telegram = form.value.telegram.replace('@', '')
  }
}

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 清理之前的預覽 URL
    if (form.value.avatarPreview) {
      URL.revokeObjectURL(form.value.avatarPreview)
    }
    form.value.avatar = file
    // 創建預覽 URL
    form.value.avatarPreview = URL.createObjectURL(file)
  }
}

// 檢查表單是否有效
const isFormValid = computed(() => {
  return !nameError.value && !telegramError.value
})

const handleUpdateProfile = async () => {
  // 先驗證所有欄位
  validateName()
  validateTelegram()
  
  loading.value = true
  message.value = ''
  messageType.value = ''

  try {
    const formData = new FormData()
    
    if (form.value.name) {
      formData.append('name', form.value.name)
    }
    
    if (form.value.telegram !== undefined) {
      formData.append('telegram', form.value.telegram)
    }
    
    if (form.value.avatar) {
      formData.append('avatar', form.value.avatar)
    }

    const result = await authStore.updateProfile(formData)

    if (result.success) {
      messageType.value = 'success'
      message.value = result.message
      
      // 更新 store 中的用戶資料
      await authStore.fetchUser()

      // 導回首頁
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      messageType.value = 'error'
      message.value = result.message
    }
  } catch (error) {
    console.error('更新資料失敗:', error)
    messageType.value = 'error'
    message.value = (
      error.response?.data?.message || '更新資料失敗，請稍後再試'
    )
  } finally {
    loading.value = false
  }
}

  // 重置表單
  const resetForm = () => {
    if (authStore.user) {
      form.value.name = authStore.user.name || ''
      form.value.telegram = authStore.user.telegram || ''
    }
    form.value.avatar = null
    
    // 清理預覽 URL
    if (form.value.avatarPreview) {
      URL.revokeObjectURL(form.value.avatarPreview)
      form.value.avatarPreview = null
    }
  }

onMounted(async () => {
  // 載入用戶資料
  await authStore.fetchUser()
  
  // 初始化表單資料
  if (authStore.user) {
    form.value.name = authStore.user.name || ''
    form.value.telegram = authStore.user.telegram || ''
  }
  
  // 進行初始驗證
  validateName()
  validateTelegram()
})

onUnmounted(() => {
  // 清理預覽 URL，避免記憶體洩漏
  if (form.value.avatarPreview) {
    URL.revokeObjectURL(form.value.avatarPreview)
  }
})
</script>

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
                  v-if="form.avatar || authStore.user?.avatar" 
                  :src="form.avatar || authStore.user?.avatar" 
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
              <label for="name" class="block text-sm font-medium text-gray-700">姓名</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="input-field mt-1"
                placeholder="請輸入您的姓名"
              />
            </div>

            <div>
              <label for="telegram" class="block text-sm font-medium text-gray-700">Telegram 聯絡方式</label>
              <input
                id="telegram"
                v-model="form.telegram"
                type="text"
                class="input-field mt-1"
                placeholder="請輸入您的 Telegram 帳號"
              />
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="submit"
                :disabled="authStore.loading"
                class="btn-primary disabled:opacity-50"
              >
                <span v-if="authStore.loading">更新中...</span>
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const form = ref({
  name: '',
  telegram: '',
  avatar: null
})

const message = ref('')
const messageType = ref('')

const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-100 border border-green-400 text-green-700'
    : 'bg-red-100 border border-red-400 text-red-700'
})

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.avatar = file
  }
}

const handleUpdateProfile = async () => {
  message.value = ''
  
  const profileData = new FormData()
  if (form.value.name) profileData.append('name', form.value.name)
  if (form.value.telegram !== undefined) profileData.append('telegram', form.value.telegram)
  if (form.value.avatar) profileData.append('avatar', form.value.avatar)
  
  const result = await authStore.updateProfile(profileData)
  
  if (result.success) {
    message.value = '資料更新成功！'
    messageType.value = 'success'
    // 重新載入用戶資料
    await authStore.fetchUser()
  } else {
    message.value = result.message
    messageType.value = 'error'
  }
}

onMounted(async () => {
  if (authStore.user) {
    form.value.name = authStore.user.name || ''
    form.value.telegram = authStore.user.telegram || ''
  }
})
</script>

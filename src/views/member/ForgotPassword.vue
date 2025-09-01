<template>
  <div class="member-page">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        忘記密碼
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        請輸入您的電子郵件，我們將發送重設密碼連結
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <form class="space-y-6" @submit.prevent="handleForgotPassword">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              電子郵件
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="input-field"
                placeholder="請輸入您的電子郵件"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="authStore.loading">發送中...</span>
              <span v-else>發送重設連結</span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/login" class="text-sm text-primary-600 hover:text-primary-500">
            返回登入頁面
          </router-link>
        </div>

        <!-- 訊息 -->
        <div v-if="message" class="mt-4 p-3 rounded" :class="messageClass">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  email: ''
})

const message = ref('')
const messageType = ref('')

const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-100 border border-green-400 text-green-700'
    : 'bg-red-100 border border-red-400 text-red-700'
})

const handleForgotPassword = async () => {
  message.value = ''
  
  const result = await authStore.forgotPassword(form.value.email)
  
  if (result.success) {
    message.value = '重設密碼連結已發送到您的郵箱'
    messageType.value = 'success'

    // 5秒後重定向到登入頁面
    setTimeout(() => {
      router.push('/login')
    }, 5000)
  } else {
    message.value = result.message
    messageType.value = 'error'
  }
}
</script>

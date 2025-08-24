<template>
  <div class="member-page">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        重設密碼
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        請輸入您的新密碼
      </p>
    </div>

    <div class="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <form class="space-y-6" @submit.prevent="handleResetPassword">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              新密碼
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                class="input-field"
                placeholder="請輸入新密碼（至少6位）"
              />
            </div>
            <div class="text-xs text-gray-500 mt-1">
              密碼長度：{{ form.password.length }}/6
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              確認新密碼
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                class="input-field"
                :class="{ 'border-red-500': passwordMismatch }"
                placeholder="請再次輸入新密碼"
              />
            </div>
            <div v-if="passwordMismatch" class="text-xs text-red-500 mt-1">
              兩次輸入的密碼不一致
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">重設中...</span>
              <span v-else>重設密碼</span>
            </button>
          </div>
        </form>

        <!-- 成功訊息 -->
        <div v-if="successMessage" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {{ successMessage }}
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ errorMessage }}
        </div>

        <!-- 令牌無效訊息 -->
        <div v-if="tokenInvalid" class="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-center">
          <p class="font-medium">重設密碼連結無效或已過期</p>
          <p class="text-sm mt-2">請重新申請重設密碼</p>
          <router-link 
            to="/forgot-password" 
            class="inline-block mt-3 text-yellow-800 hover:text-yellow-900 underline"
          >
            前往忘記密碼頁面
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const tokenInvalid = ref(false)

// 從 URL 參數獲取令牌
const resetToken = computed(() => route.query.token)

// 檢查密碼是否匹配
const passwordMismatch = computed(() => {
  return form.value.password && 
         form.value.confirmPassword && 
         form.value.password !== form.value.confirmPassword
})

// 檢查表單是否有效
const isFormValid = computed(() => {
  return form.value.password.length >= 6 && 
         form.value.confirmPassword.length >= 6 && 
         !passwordMismatch.value
})

// 重設密碼
const handleResetPassword = async () => {
  if (!resetToken.value) {
    errorMessage.value = '缺少重設密碼令牌'
    return
  }

  if (passwordMismatch.value) {
    errorMessage.value = '兩次輸入的密碼不一致'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await axios.post('/api/auth/reset-password', {
      token: resetToken.value,
      password: form.value.password
    })

    successMessage.value = response.data.message
    
    // 1.5秒後重定向到登入頁面
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    if (error.response?.status === 400) {
      errorMessage.value = error.response.data.message
      
      // 如果是令牌相關錯誤，顯示令牌無效訊息
      if (error.response.data.message.includes('令牌')) {
        tokenInvalid.value = true
      }
    } else {
      errorMessage.value = '重設密碼失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 檢查是否有令牌
  if (!resetToken.value) {
    tokenInvalid.value = true
    errorMessage.value = '缺少重設密碼令牌'
  }

  // 如果已經登入，重定向到首頁
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

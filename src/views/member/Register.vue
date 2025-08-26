<template>
  <div class="member-page">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        註冊新帳號
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        或
        <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
          登入現有帳號
        </router-link>
      </p>
    </div>

    <!-- 免責聲明 -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <Declaration @agree="isAgree = $event" need-agree-button />
    </div>
    <div class="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <form class="space-y-6" @submit.prevent="handleRegister">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              暱稱
            </label>
            <div class="mt-1">
              <input
                id="name"
                v-model="form.name"
                name="name"
                type="text"
                autocomplete="name"
                required
                class="input-field"
                placeholder="請輸入您的暱稱"
              />
            </div>
          </div>

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
                :class="[
                  'input-field',
                  form.email.trim() && !isEmailValid ? 'border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="僅能使用 @neutec.com.tw 信箱註冊"
              />
              <p v-if="form.email.trim() && !isEmailValid" class="mt-1 text-sm text-red-600">
                {{ getEmailError }}
              </p>
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              密碼
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                :class="[
                  'input-field',
                  form.password && !isPasswordValid ? 'border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="請輸入密碼（至少6位，需包含字母和數字）"
              />
              <p v-if="form.password && !isPasswordValid" class="mt-1 text-sm text-red-600">
                {{ getPasswordError }}
              </p>
              <!-- 密码强度指示器 -->
              <div v-if="form.password" class="mt-2">
                <div class="flex items-center space-x-2">
                  <div class="text-xs text-gray-500">密碼強度:</div>
                  <div class="flex space-x-1">
                    <div 
                      v-for="i in 3" 
                      :key="i"
                      :class="[
                        'w-2 h-2 rounded-full',
                        getPasswordStrength >= i ? 'bg-green-500' : 'bg-gray-300'
                      ]"
                    ></div>
                  </div>
                  <span class="text-xs" :class="getPasswordStrengthText.color">
                    {{ getPasswordStrengthText.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              確認密碼
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                :class="[
                  'input-field',
                  form.confirmPassword && !isConfirmPasswordValid ? 'border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="請再次輸入密碼"
              />
              <p v-if="form.confirmPassword && !isConfirmPasswordValid" class="mt-1 text-sm text-red-600">
                {{ getConfirmPasswordError }}
              </p>
            </div>
          </div>

          <div>
            <label for="telegram" class="block text-sm font-medium text-gray-700 flex justify-between">
              <span>Telegram 帳號</span>
              <Tooltip 
                text="如何找到您的Telegram帳號：&#10;1. 打開Telegram應用&#10;2. 點擊左上角選單&#10;3. 查看您的用戶名（@username）&#10;4. 或者點擊您的頭像查看完整資料"
                position="top"
              >
                <span class="text-xs text-gray-500 cursor-help">
                  <Icon name="information-circle" class="w-4 h-4" />
                </span>
              </Tooltip>
            </label>
            <div class="mt-1">
              <input
                id="telegram"
                v-model="form.telegram"
                @input="handleTelegramInput"
                name="telegram"
                type="text"
                class="input-field"
                placeholder="Telegram 帳號，方便買家聯繫您"
              />
            </div>
          </div>

          <!-- 錯誤訊息 -->
          <div v-if="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ errorMessage }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.loading || !isFormValid"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="authStore.loading">註冊中...</span>
              <span v-else>註冊</span>
            </button>
          </div>
        </form>

        <!-- 成功訊息 -->
        <div v-if="successMessage" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Declaration from '@/components/Declaration.vue'
import Icon from '@/components/Icon.vue'
import Tooltip from '@/components/Tooltip.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  telegram: ''
})

const errorMessage = ref('')
const successMessage = ref('')
const isAgree = ref(false)

const isFormValid = computed(() => {
  return form.value.name.trim() &&
         isEmailValid.value &&
         isPasswordValid.value &&
         isConfirmPasswordValid.value &&
         form.value.telegram.trim()
})

// 郵箱驗證
const isEmailValid = computed(() => {
  const email = form.value.email.trim()
  if (!email) return false
  
  // 檢查信箱是否為 neutec.com.tw 域名
  const emailRegex = /^[^\s@]+@neutec\.com\.tw$/
  return emailRegex.test(email)
})

// 密碼驗證
const isPasswordValid = computed(() => {
  const password = form.value.password
  if (!password) return false
  
  // 至少6位，包含字母和數字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/
  return passwordRegex.test(password)
})

// 確認密碼驗證
const isConfirmPasswordValid = computed(() => {
  return form.value.password && 
         form.value.confirmPassword && 
         form.value.password === form.value.confirmPassword
})

// 獲取驗證錯誤信息
const getEmailError = computed(() => {
  const email = form.value.email.trim()
  if (!email) return '請輸入電子郵件'
  if (!isEmailValid.value) return '請使用 @neutec.com.tw 域名'
  return ''
})

const getPasswordError = computed(() => {
  const password = form.value.password
  if (!password) return '請輸入密碼'
  if (password.length < 6) return '密碼長度至少需要6位'
  if (!isPasswordValid.value) return '密碼需包含字母和數字'
  return ''
})

const getConfirmPasswordError = computed(() => {
  if (!form.value.confirmPassword) return '請確認密碼'
  if (form.value.password !== form.value.confirmPassword) return '密碼與確認密碼不符'
  return ''
})

// 密碼強度計算
const getPasswordStrength = computed(() => {
  const password = form.value.password
  if (!password) return 0
  
  let score = 0
  
  // 長度檢查
  if (password.length >= 6) score += 1
  if (password.length >= 8) score += 1
  
  // 包含字母和數字
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1
  
  // 包含特殊字符號
  if (/[@$!%*?&]/.test(password)) score += 1
  
  return Math.min(score, 3)
})

const getPasswordStrengthText = computed(() => {
  const strength = getPasswordStrength.value
  
  if (strength === 0) return { text: '弱', color: 'text-red-500' }
  if (strength === 1) return { text: '弱', color: 'text-red-500' }
  if (strength === 2) return { text: '中', color: 'text-yellow-500' }
  if (strength === 3) return { text: '強', color: 'text-green-500' }
  
  return { text: '弱', color: 'text-red-500' }
})

const handleTelegramInput = () => {
  if(form.value.telegram.includes('@')) {
    form.value.telegram = form.value.telegram.replace('@', '')
  }
}

const handleRegister = async () => {
  if (!isAgree.value) {
    errorMessage.value = '請先同意免責聲明'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  
  if (!isFormValid.value) {
    // 顯示第一個驗證錯誤
    if (getEmailError.value) {
      errorMessage.value = getEmailError.value
    } else if (getPasswordError.value) {
      errorMessage.value = getPasswordError.value
    } else if (getConfirmPasswordError.value) {
      errorMessage.value = getConfirmPasswordError.value
    } else if (!form.value.telegram.trim()) {
      errorMessage.value = '請輸入 Telegram 聯絡方式'
    } else {
      errorMessage.value = '請填寫所有必填欄位'
    }
    return
  }
  
  const userData = {
    name: form.value.name.trim(),
    email: form.value.email.trim(),
    password: form.value.password,
    telegram: form.value.telegram.trim(),
    username: form.value.name.trim()
  }
  
  const result = await authStore.register(userData)
  
  if (result.success) {
    successMessage.value = '註冊成功！正在跳轉...'
    setTimeout(() => {
      router.push('/')
    }, 500)
  } else {
    errorMessage.value = result.message
  }
}

onMounted(() => {
  // 如果已經登入，重定向到首頁
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

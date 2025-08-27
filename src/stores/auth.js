import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { UserStatus } from '@/ts/index.enums'


export const useAuthStore = defineStore('auth', () => {
  // 使用者資料
  const user = ref(null)
  // 令牌
  const token = ref(localStorage.getItem('token') || null)
  // 載入狀態
  const loading = ref(false)

  // 計算是否登入
  const isAuthenticated = computed(() => !!token.value)
  // 計算是否為管理員
  const isAdmin = computed(() => user.value?.role === 'admin')

  // 設置認證標頭
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // 登入
  const login = async (email, password) => {
    try {
      loading.value = true
      const response = await axios.post('/api/auth/login', { email, password })
      
      const { user: userData, token: tokenData } = response.data
      user.value = userData
      token.value = tokenData
      
      localStorage.setItem('token', tokenData)
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '登入失敗' 
      }
    } finally {
      loading.value = false
    }
  }

  // 註冊
  const register = async (userData) => {
    try {
      loading.value = true
      console.log('🚀 開始註冊請求...')
      
      const response = await axios.post('/api/auth/register', userData, {
        timeout: 15000 // 15秒超時
      })
      
      console.log('✅ 註冊成功:', response.data)
      
      const { user: newUser, token: tokenData } = response.data
      user.value = newUser
      token.value = tokenData
      
      localStorage.setItem('token', tokenData)
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`
      
      return { success: true }
    } catch (error) {
      console.error('❌ 註冊失敗:', error)
      
      if (error.code === 'ECONNABORTED') {
        return { 
          success: false, 
          message: '註冊請求超時，請檢查網路連線' 
        }
      }
      
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data?.message || '註冊失敗' 
        }
      }
      
      if (error.request) {
        return { 
          success: false, 
          message: '無法連接到伺服器，請檢查網路連線' 
        }
      }
      
      return { 
        success: false, 
        message: '註冊失敗：' + (error.message || '未知錯誤') 
      }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  // 取得使用者資料
  const fetchUser = async () => {
    if (!token.value) return
    
    try {
      const response = await axios.get('/api/auth/me')
      user.value = response.data.user

      // 如果使用者被停權，則登出
      if(user.value.status === UserStatus.Suspended) {
        logout()
      }
    } catch (error) {
      logout()
    }
  }

  // 更新使用者資料
  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      const response = await axios.put('/api/auth/profile', profileData)
      user.value = response.data.user
      return { success: true, message: response.data.message || '更新成功' }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '更新失敗' 
      }
    } finally {
      loading.value = false
    }
  }

  // 忘記密碼
  const forgotPassword = async (email) => {
    try {
      loading.value = true
      await axios.post('/api/auth/forgot-password', { email })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '發送失敗' 
      }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    forgotPassword
  }
})

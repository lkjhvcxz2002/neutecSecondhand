import { ref } from 'vue'
import axios from 'axios'
import { ProductStatus, UserStatus } from '@/ts/index.enums'

// 狀態
const users = ref([])
const products = ref([])
const stats = ref({})
const loading = ref(false)

// 獲取統計資料
const fetchStats = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/admin/stats')
    stats.value = response.data.stats
    return { success: true, data: response.data.stats }
  } catch (error) {
    console.error('獲取統計資料失敗:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '獲取統計資料失敗' 
    }
  } finally {
    loading.value = false
  }
}

// 獲取用戶列表
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/admin/users')
    users.value = response.data.users
    return { success: true, data: response.data.users }
  } catch (error) {
    console.error('獲取用戶列表失敗:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '獲取用戶列表失敗' 
    }
  } finally {
    loading.value = false
  }
}

// 獲取商品列表
const fetchProducts = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/admin/products')
    products.value = response.data.products
    return { success: true, data: response.data.products }
  } catch (error) {
    console.error('獲取商品列表失敗:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '獲取商品列表失敗' 
    }
  } finally {
    loading.value = false
  }
}

// 重新整理所有資料
const refreshAll = async () => {
  try {
    loading.value = true
    const results = await Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchProducts()
    ])
    
    const hasError = results.some(result => !result.success)
    if (hasError) {
      return { 
        success: false, 
        message: '部分資料載入失敗' 
      }
    }
    
    return { success: true, message: '資料已重新整理' }
  } catch (error) {
    console.error('重新整理資料失敗:', error)
    return { 
      success: false, 
      message: '重新整理資料失敗' 
    }
  } finally {
    loading.value = false
  }
}

// 切換用戶狀態
const toggleUserStatus = async (userId, currentStatus) => {
  try {
    const newStatus = currentStatus === UserStatus.Active ? UserStatus.Suspended : UserStatus.Active
    const response = await axios.patch(`/api/admin/users/${userId}/status`, {
      status: newStatus
    })
    
    // 更新本地狀態
    const userIndex = users.value.findIndex(user => user.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].status = newStatus
    }
    
    return { 
      success: true, 
      message: response.data.message,
      data: { userId, newStatus }
    }
  } catch (error) {
    console.error('切換用戶狀態失敗:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '切換用戶狀態失敗' 
    }
  }
}

// 切換用戶角色
const toggleUserRole = async (userId, currentRole) => {
  try {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const response = await axios.patch(`/api/admin/users/${userId}/role`, {
      role: newRole
    })
    
    // 更新本地狀態
    const userIndex = users.value.findIndex(user => user.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole
    }
    
    return { 
      success: true, 
      message: response.data.message,
      data: { userId, newRole }
    }
  } catch (error) {
    console.error('切換用戶角色失敗:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '切換用戶角色失敗' 
    }
  }
}

// 切換商品狀態
const toggleProductStatus = async (productId, currentStatus) => {
  try {
    const newStatus = currentStatus === ProductStatus.Inactive ? ProductStatus.Active : ProductStatus.Inactive
    const response = await axios.patch(`/api/admin/products/${productId}/status`, {
      status: newStatus
    })
    
    // 更新本地狀態
    const productIndex = products.value.findIndex(product => product.id === productId)
    if (productIndex !== -1) {
      products.value[productIndex].status = newStatus
    }
    
    return { 
      success: true, 
      message: response.data.message,
      data: { productId, newStatus }
    }
  } catch (error) {
    console.error('切換商品狀態失敗:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '切換商品狀態失敗' 
    }
  }
}

// 重置狀態
const resetState = () => {
  users.value = []
  products.value = []
  stats.value = {}
  loading.value = false
}

export const useAdminStore = () => {
  return {
    // 狀態
    users,
    products,
    stats,
    loading,
    
    // 方法
    fetchStats,
    fetchUsers,
    fetchProducts,
    refreshAll,
    toggleUserStatus,
    toggleUserRole,
    toggleProductStatus,
    resetState
  }
}

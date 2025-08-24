import { ref } from 'vue'
import axios from 'axios'

// 狀態
const maintenanceMode = ref(false)
const loading = ref(false)

// 獲取維護模式狀態
const fetchMaintenanceStatus = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/maintenance/status')
    if (response.data.success) {
      maintenanceMode.value = response.data.maintenanceMode
    }
    return { success: true, data: response.data.maintenanceMode }
  } catch (error) {
    console.error('獲取維護模式狀態失敗:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '獲取維護模式狀態失敗' 
    }
  } finally {
    loading.value = false
  }
}

// 切換維護模式（需要管理員權限）
const toggleMaintenanceMode = async () => {
  try {
    loading.value = true
    const response = await axios.post('/api/admin/maintenance/toggle')
    
    if (response.data.success !== false) {
      maintenanceMode.value = response.data.maintenanceMode
      return { 
        success: true, 
        message: response.data.message,
        data: response.data.maintenanceMode
      }
    } else {
      return { 
        success: false, 
        message: response.data.message 
      }
    }
  } catch (error) {
    console.error('切換維護模式失敗:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '切換維護模式失敗' 
    }
  } finally {
    loading.value = false
  }
}

// 重置狀態
const resetState = () => {
  maintenanceMode.value = false
  loading.value = false
}

export const useMaintenanceStore = () => {
  return {
    // 狀態
    maintenanceMode,
    loading,
    
    // 方法
    fetchMaintenanceStatus,
    toggleMaintenanceMode,
    resetState
  }
}

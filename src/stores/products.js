import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useProductsStore = defineStore('products', () => {
  // 商品列表
  const products = ref([])
  // 當前商品
  const currentProduct = ref(null)
  // 載入狀態
  const loading = ref(false)
  // 過濾條件
  const filters = ref({
    category: '',
    status: '',
    search: '',
    priceRange: { min: 0, max: 999999 }
  })

  // 計算過濾後的商品列表
  const filteredProducts = computed(() => {
    let filtered = [...products.value]
    
    if (filters.value.category) {
      filtered = filtered.filter(p => p.category === filters.value.category)
    }
    
    if (filters.value.status) {
      filtered = filtered.filter(p => p.status === filters.value.status)
    }
    
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      )
    }
    
    if (filters.value.priceRange.min > 0 || filters.value.priceRange.max < 999999) {
      filtered = filtered.filter(p => 
        p.price >= filters.value.priceRange.min && 
        p.price <= filters.value.priceRange.max
      )
    }
    
    return filtered
  })

  // 獲取商品列表
  const fetchProducts = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/products')
      products.value = response.data.products
    } catch (error) {
      console.error('獲取商品失敗:', error)
    } finally {
      loading.value = false
    }
  }

  // 獲取單個商品
  const fetchProduct = async (id) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/products/${id}`)
      currentProduct.value = response.data.product
      return response.data.product
    } catch (error) {
      console.error('獲取商品詳情失敗:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 創建商品
  const createProduct = async (productData) => {
    try {
      loading.value = true
      const formData = new FormData()
      
      Object.keys(productData).forEach(key => {
        if (key === 'images' && productData[key]) {
          productData[key].forEach(image => {
            formData.append('images', image)
          })
        } else {
          formData.append(key, productData[key])
        }
      })
      
      const response = await axios.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      products.value.unshift(response.data.product)
      return { success: true, product: response.data.product }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '創建商品失敗' 
      }
    } finally {
      loading.value = false
    }
  }

  // 更新商品
  const updateProduct = async (id, productData) => {
    try {
      loading.value = true
      const formData = new FormData()
      
      Object.keys(productData).forEach(key => {
        if (key === 'images' && productData[key]) {
          productData[key].forEach(image => {
            formData.append('images', image)
          })
        } else {
          formData.append(key, productData[key])
        }
      })
      
      const response = await axios.put(`/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data.product
      }
      
      if (currentProduct.value?.id === id) {
        currentProduct.value = response.data.product
      }
      
      return { success: true, product: response.data.product }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '更新商品失敗' 
      }
    } finally {
      loading.value = false
    }
  }

  // 刪除商品
  const deleteProduct = async (id) => {
    try {
      loading.value = true
      await axios.delete(`/api/products/${id}`)
      
      products.value = products.value.filter(p => p.id !== id)
      if (currentProduct.value?.id === id) {
        currentProduct.value = null
      }
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '刪除商品失敗' 
      }
    } finally {
      loading.value = false
    }
  }

  // 更新商品狀態
  const updateProductStatus = async (id, status) => {
    try {
      loading.value = true
      const response = await axios.patch(`/api/products/${id}/status`, { status })
      
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data.product
      }
      
      if (currentProduct.value?.id === id) {
        currentProduct.value = response.data.product
      }
      
      return { success: true, product: response.data.product }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '更新狀態失敗' 
      }
    } finally {
      loading.value = false
    }
  }

  // 設置過濾條件
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // 清除過濾條件
  const clearFilters = () => {
    filters.value = {
      category: '',
      status: '',
      search: '',
      priceRange: { min: 0, max: 999999 }
    }
  }

  return {
    products,
    currentProduct,
    loading,
    filters,
    filteredProducts,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    setFilters,
    clearFilters
  }
})

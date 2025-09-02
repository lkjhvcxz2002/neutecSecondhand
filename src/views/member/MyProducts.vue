<template>
    <div class="space-y-6">
      <!-- 頁面標題 -->
      <div class="flex items-center justify-between">
        <h1 class="page-title">我的商品</h1>
        <router-link to="/add-product" class="btn-primary">
          <Icon name="plus" size="sm" class="mr-2" />
          上架新商品
        </router-link>
      </div>

      <!-- 統計資訊 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ getStatusCount(ProductStatus.Active) }}</div>
            <div class="text-sm text-gray-600">上架中</div>
          </div>
        </div>
        <div class="card">
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ getStatusCount(ProductStatus.Processing) }}</div>
            <div class="text-sm text-gray-600">交易中</div>
          </div>
        </div>
        <div class="card">
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ getStatusCount(ProductStatus.Sold) }}</div>
            <div class="text-sm text-gray-600">已售出</div>
          </div>
        </div>
        <div class="card">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-600">{{ getStatusCount(ProductStatus.Inactive) }}</div>
            <div class="text-sm text-gray-600">已下架</div>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div v-if="productsStore.userProductsLoading" class="text-center py-12">
        <div class="text-gray-500">載入中...</div>
      </div>
      
      <div v-else-if="!hasProducts" class="text-center py-12">
        <div class="text-gray-500 mb-4">您還沒有上架任何商品</div>
        <router-link to="/add-product" class="btn-primary">
          立即上架第一個商品
        </router-link>
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="product in filteredUserProducts" 
          :key="product.id"
          class="card hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col md:flex-row gap-4">
            <!-- 商品圖片 -->
            <div class="w-full md:w-32 h-32 flex-shrink-0 relative">
              <ProductStatusTag :status="product.status" class="absolute" />
              <div v-if="product.images && product.images.length > 0" class="w-full h-full bg-black/10 rounded-lg flex items-center justify-center">
                <img 
                  :src="getProductImageUrl(product.images[0])" 
                  :alt="product.title"
                  class="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
              <div v-else class="w-full h-full bg-black/10 rounded-lg flex items-center justify-center">
                <span class="text-gray-400 text-sm">無圖片</span>
              </div>
            </div>

            <!-- 商品資訊 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-lg font-semibold text-gray-900 truncate">{{ product.title }}</h3>
              </div>
              
              <p class="text-gray-600 mb-3 line-clamp-2">{{ product.description }}</p>
              
              <div class="flex flex-wrap gap-2 mb-3">
                <span 
                  class="text-xs text-white px-2 py-1 rounded-md"
                  :class="getTradeTypeClass(product.trade_type)"
                >
                  {{ getTradeTypeText(product.trade_type) }}
                </span>
                <span class="text-sm text-gray-500">{{ product.category }}</span>
                <span v-if="product.trade_type === 'sale'" class="text-lg font-bold text-primary-600">
                  NT$ {{ product.price }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">上架時間：{{ formatDate(product.created_at) }}</span>
                <Tooltip
                  :text="`所有商品，均會在上架3個月後自動刪除`"
                  :position="'left'"
                >
                  <span class="text-sm text-gray-500"> 
                    距離商品刪除還剩 <span class="font-bold text-red-500">{{ calculateDaysUntilExpiration(product.created_at) }}</span> 天
                  </span>
                </Tooltip>
              </div>

              <!-- 操作按鈕 -->
              <div class="flex flex-wrap gap-2">
                <router-link 
                  :to="`/products/${product.id}`" 
                  class="btn-secondary"
                >
                  <Icon name="eye" size="sm" class="mr-1" />
                  查看
                </router-link>
                
                <router-link 
                  v-if="canEdit(product.status)"
                  :to="`/edit-product/${product.id}`" 
                  class="btn-secondary"
                >
                  <Icon name="pencil" size="sm" class="mr-1" />
                  編輯
                </router-link>
                
                <button 
                  v-if="canToggleStatus(product.status)"
                  @click="toggleProductStatus(product)"
                  class="btn-secondary"
                >
                  <Icon name="arrow-path" size="sm" class="mr-1" />
                  {{ product.status === 'active' ? '下架' : '重新上架' }}
                </button>

                <button 
                  v-if="canEdit(product.status)"
                  @click="deleteProduct(product.id)"
                  class="btn-danger"
                >
                  <Icon name="trash" size="sm" class="mr-1" />
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 狀態切換確認對話框 -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">確認狀態變更</h3>
        <p class="text-gray-600 mb-6">
          確定要將商品「{{ selectedProduct?.title }}」{{ selectedProduct?.status === 'active' ? '下架' : '重新上架' }}嗎？
        </p>
        <div class="flex gap-3 justify-end">
          <button @click="showStatusModal = false" class="btn-secondary">
            取消
          </button>
          <button @click="confirmStatusChange" class="btn-primary">
            確認
          </button>
        </div>
      </div>
    </div>

    <!-- 刪除確認對話框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">確認刪除</h3>
        <p class="text-gray-600 mb-6">
          確定要刪除商品「{{ selectedProduct?.title }}」嗎？此操作無法復原。
        </p>
        <div class="flex gap-3 justify-end">
          <button @click="showDeleteModal = false" class="btn-secondary">
            取消
          </button>
          <button @click="confirmDelete" class="btn-danger">
            確認刪除
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import { useTradeType } from '@/composables/useTradeType'
import { useProductStatus } from '@/composables/useProductStatus'
import { TradeType, ProductStatus } from '@/ts/index.enums'
import Layout from '@/components/Layout.vue'
import Icon from '@/components/Icon.vue'
import ProductStatusTag from '@/components/ProductStatusTag.vue'
import { getProductImageUrl } from '@/utils/imageUrl'
import Tooltip from '@/components/Tooltip.vue'
import { calculateDaysUntilExpiration } from '@/utils/common'

const productsStore = useProductsStore()
const authStore = useAuthStore()

// 篩選條件
const statusFilter = ref('')
const tradeTypeFilter = ref('')
const searchQuery = ref('')

// 對話框狀態
const showStatusModal = ref(false)
const showDeleteModal = ref(false)
const selectedProduct = ref(null)

// 計算篩選後的商品列表
const filteredUserProducts = computed(() => {
  let filtered = [...productsStore.userProducts]
  
  if (statusFilter.value) {
    filtered = filtered.filter(p => p.status === statusFilter.value)
  }
  
  if (tradeTypeFilter.value) {
    filtered = filtered.filter(p => p.trade_type === tradeTypeFilter.value)
  }
  
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    )
  }
  
  return filtered
})

// 檢查是否有商品
const hasProducts = computed(() => {
  return productsStore.userProducts && productsStore.userProducts.length > 0
})

// 獲取各狀態的商品數量
const getStatusCount = (status) => {
  return productsStore.userProducts.filter(p => p.status === status).length
}

// 獲取交易類型樣式
const getTradeTypeClass = (tradeType) => {
  const { tradeTypeClass } = useTradeType(ref(tradeType))
  return tradeTypeClass.value
}

// 獲取交易類型文本
const getTradeTypeText = (tradeType) => {
  const { tradeTypeText } = useTradeType(ref(tradeType))
  return tradeTypeText.value
}

// 檢查是否可以編輯
const canEdit = (status) => {
  const { isEditable } = useProductStatus(ref(status))
  return isEditable.value
}

// 檢查是否可以切換狀態
const canToggleStatus = (status) => {
  const { canToggleStatus } = useProductStatus(ref(status))
  return canToggleStatus.value
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 切換商品狀態
const toggleProductStatus = (product) => {
  selectedProduct.value = product
  showStatusModal.value = true
}

// 確認狀態變更
const confirmStatusChange = async () => {
  if (!selectedProduct.value) return
  
  const newStatus = selectedProduct.value.status === ProductStatus.Active ? ProductStatus.Inactive : ProductStatus.Active
  const result = await productsStore.updateProductStatus(selectedProduct.value.id, newStatus)
  
  if (result.success) {
    // 重新獲取用戶商品
    await productsStore.fetchUserProducts()
  }
  
  showStatusModal.value = false
  selectedProduct.value = null
}

// 刪除商品
const deleteProduct = (productId) => {
  selectedProduct.value = productsStore.userProducts.find(p => p.id === productId)
  showDeleteModal.value = true
}

// 確認刪除
const confirmDelete = async () => {
  if (!selectedProduct.value) return
  
  const result = await productsStore.deleteProduct(selectedProduct.value.id)
  
  if (result.success) {
    // 重新獲取用戶商品
    await productsStore.fetchUserProducts()
  }
  
  showDeleteModal.value = false
  selectedProduct.value = null
}

// 頁面載入時獲取用戶商品
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await productsStore.fetchUserProducts()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

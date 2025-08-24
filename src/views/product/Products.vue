<template>
  <div>
         <h1 class="page-title">商品列表</h1>
    <!-- 搜尋和篩選 -->
    <div class="card mb-6" :class="{ 'pb-1': !displayFullFilters }">
             <!-- 篩選器頭部 -->
       <div class="card-header">
                 <button 
           @click="toggleFilters"
           v-if="indexStore.isMobile || indexStore.isTablet"
           class="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
         >
           <span>{{ showFilters ? '收起' : '篩選' }}</span>
           <Icon 
             name="chevron-down" 
             size="sm" 
             class="transition-transform duration-200"
             :class="{ 'rotate-180': showFilters }"
           />
         </button>
      </div>
      
             <!-- 篩選器內容 -->
       <div 
         v-show="displayFullFilters"
         class="card-content transition-all duration-300 ease-in-out"
       >
        <!-- 搜尋框 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">搜尋</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋商品..."
            class="input-field"
          />
        </div>
        
                 <!-- 分類和狀態選擇器 -->
         <div class="form-row">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">分類</label>
            <select v-model="selectedCategory" class="input-field">
              <option value="">全部分類</option>
              <option v-for="category in ProductCategory" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">狀態</label>
            <select v-model="selectedStatus" class="input-field">
              <option value="">全部狀態</option>
              <option v-for="status in availableProductStatus" :key="status" :value="status">{{ getProductStatusText(status) }}</option>
            </select>
          </div>
        </div>
        
          <!-- 清除篩選按鈕 -->
         <div class="form-actions">
          <button @click="clearFilters" class="btn-secondary px-6">
            清除篩選
          </button>
        </div>
      </div>
      
        <!-- 當前篩選條件顯示 -->
       <div v-if="hasActiveFilters" class="card-footer">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-600">當前篩選:</span>
          <span 
             v-if="searchQuery" 
             class="filter-tag filter-tag-blue"
           >
             搜尋: {{ searchQuery }}
             <button @click="searchQuery = ''" class="filter-tag-remove text-blue-600">×</button>
           </span>
           <span 
             v-if="selectedCategory" 
             class="filter-tag filter-tag-green"
           >
             分類: {{ selectedCategory }}
             <button @click="selectedCategory = ''" class="filter-tag-remove text-green-600">×</button>
           </span>
           <span 
             v-if="selectedStatus" 
             class="filter-tag filter-tag-purple"
           >
             狀態: {{ getProductStatusText(selectedStatus) }}
             <button @click="selectedCategory = ''" class="filter-tag-remove text-purple-600">×</button>
           </span>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div v-if="productsStore.loading" class="text-center py-12">
      <div class="text-gray-500">載入中...</div>
    </div>
    
    <div v-else-if="!hasAvailableProducts" class="text-center py-12">
      <div class="text-gray-500">沒有找到商品</div>
    </div>
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="product in productsStore.filteredProducts" 
        :key="product.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer relative"
        @click="$router.push(`/products/${product.id}`)"
      >
        <ProductStatusTag :status="product.status" />
        
        <!-- 商品圖片 -->
        <div v-if="product.images && product.images.length > 0" class="w-full h-48">
        <img 
          :src="product.images[0]" 
          :alt="product.title"
          class="w-full h-48 object-cover rounded-lg mb-4"
        />
        </div>
        <div v-else class="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
          <span class="text-gray-400 text-sm">無圖片</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ product.title }}</h3>
        <p class="text-gray-600 mb-2 line-clamp-2">{{ product.description }}</p>
        <!-- 交易細節 -->
        <div class="flex justify-between items-center">
          <span>
            <!-- 交易類型標籤 -->
            <span 
              class="text-xs text-white px-2 py-1 rounded-md"
              :class="getTradeTypeClass(product.trade_type)"
            >
              {{ getTradeTypeText(product.trade_type) }}
            </span>
            <span class="text-xl ml-2 font-bold text-primary-600" v-if="product.trade_type === TradeType.Sell">NT$ {{ product.price }}</span>
            </span>
          <span class="text-sm text-gray-500">{{ product.category }}</span>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-sm text-gray-500">
            賣家: {{ product.seller_name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useIndexStore } from '@/stores/index'
import Icon from '@/components/Icon.vue'
import { useTradeType } from '@/composables/useTradeType'
import { TradeType, ProductCategory, ProductStatus } from '@/ts/index.enums'
import { useProductStatus } from '@/composables/useProductStatus'
import ProductStatusTag from '@/components/ProductStatusTag.vue'

const productsStore = useProductsStore()
const indexStore = useIndexStore()

const hasAvailableProducts = computed(() => {
  return productsStore.filteredProducts && productsStore.filteredProducts.length > 0
})

// 获取交易类型样式的辅助函数
const getTradeTypeClass = (tradeType) => {
  const { tradeTypeClass } = useTradeType(ref(tradeType))
  return tradeTypeClass.value
}

// 获取交易类型文本的辅助函数
const getTradeTypeText = (tradeType) => {
  const { tradeTypeText } = useTradeType(ref(tradeType))
  return tradeTypeText.value
}

// 获取商品状态文本的辅助函数
const getProductStatusText = (status) => {
  const { productStatusText } = useProductStatus(ref(status))
  return productStatusText.value
}

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const showFilters = ref(false) // 控制篩選器顯示/隱藏
const availableProductStatus = ref([ProductStatus.Active, ProductStatus.Processing])

// 判斷是否顯示完整篩選器
const displayFullFilters = computed(() => {
  return showFilters.value || indexStore.isDesktop
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
}

// 切換篩選器顯示/隱藏
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// 檢查是否有活躍的篩選條件
const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedStatus.value
})


onMounted(async () => {
  await productsStore.fetchProducts()
})

// 監聽篩選條件變化
watch([searchQuery, selectedCategory, selectedStatus], () => {
  // 這裡可以觸發新的搜尋請求，但目前沒有實作 
  productsStore.setFilters({
    search: searchQuery.value,
    category: selectedCategory.value,
    status: selectedStatus.value
  })
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

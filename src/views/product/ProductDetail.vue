<template>
  <div>
    <div v-if="productsStore.loading" class="text-center py-12">
      <div class="text-gray-500">載入中...</div>
    </div>
    
    <div v-else-if="!product" class="text-center py-12">
      <div class="text-gray-500">商品不存在</div>
    </div>
    
    <div v-else class="grid lg:grid-cols-2 gap-8">
      <!-- 商品圖片 -->
      <div>
        <div v-if="product.images && product.images.length > 0" class="space-y-4">
          <!-- 先暫時將第一張圖片作為主圖 -->
          <div class="w-full h-96">
            <img 
              :src="getProductImageUrl(product.images[0])" 
              :alt="`${product.title} - 主圖`"
              class="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <!-- 手機版縮圖說明 -->
          <div v-if="indexStore.isMobile">
            <div class="w-full flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              -- 點擊以下縮圖放大 --
            </div>
          </div>
          <!-- 縮圖 -->
          <div v-if="product.images.length > 0" class="w-full flex flex-wrap">
            <div v-for="(image, index) in product.images" :key="index" class="w-1/3">
              <div class="relative group" @click="openLightbox(index)">
                <img 
                  :src="getProductImageUrl(image)" 
                  :alt="`${product.title} - 縮略圖 ${index + 1}`"
                  class="w-full h-24 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-primary-500 hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                />
                <!-- 點擊提示覆蓋層 -->
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Icon name="eye" class="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                </div>
                <!-- 點擊提示文字 -->
                <div class="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  點擊放大
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <div class="text-gray-400">無圖片</div>
        </div>
      </div>

      <!-- 商品資訊 -->
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.title }}</h1>
          <!-- 價格 -->
          <div class="flex items-center">
            <span 
              class="text-xs text-white px-2 py-1 rounded-md mr-2"
              :class="tradeTypeClass"
            >
              {{ tradeTypeText }}
            </span>
            <span class="text-2xl font-bold text-primary-600" v-if="shouldShowPrice">NT$ {{ product.price }}</span>
          </div>
        </div>

        <!-- 商品資訊 -->
        <div class="border-t border-gray-200 pt-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">商品資訊</h3>
            <p class="text-gray-600">{{ product.description || '無描述' }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-500">狀態</span>
              <p class="text-gray-900">
                <span class="py-1 font-bold" :class="productStatusClass">
                  {{ productStatusText }}
                </span>
              </p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">分類</span>
              <p class="text-gray-900">{{ product.category }}</p>
            </div>
          </div>
        </div>

        <!-- 賣家資訊 -->
        <div class="border-t border-gray-200 pt-4">
          <span class="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            賣家資訊
            <span class="text-sm text-gray-500">(請主動聯繫賣家進行交易)</span>
          </span>
          <div 
            v-if="product.seller_telegram"
            @click="openTelegramLink(product.seller_telegram, product)"
            class="border border-gray-200 rounded-lg bg-green-200 p-2 mt-2 flex items-center space-x-3 cursor-pointer hover:bg-green-300 hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <img 
                v-if="product.seller_avatar"
                :src="getAvatarUrl(product.seller_avatar)" 
                :alt="`${product.seller_name} - 頭像`"
                class="w-full h-full object-cover rounded-full"
              />
              <Icon v-else name="user-circle" size="md" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ product.seller_name }}</p>
              <p class="text-sm text-gray-500">
                Telegram: 
                <span class="text-primary-600 font-medium">
                  @{{ product.seller_telegram }}
                </span>
                <span class="text-xs text-gray-400 ml-1">(點擊卡片開啟 Telegram 聊天)</span>
              </p>
            </div>
            <Icon name="arrow-right-start-on-rectangle" class="w-5 h-5 text-gray-500" />
          </div>
          <div v-else class="border border-gray-200 rounded-lg bg-gray-100 p-2 mt-2 flex items-center space-x-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Icon name="user-circle" size="md" />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ product.seller_name }}</p>
              <p class="text-sm text-gray-500">
                賣家尚未設定 Telegram，請自行聯繫賣家。
              </p>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div v-if="authStore.isAuthenticated && isProductOwner" class="border-t border-gray-200 pt-4 space-y-3 flex flex-col">
          <!-- 編輯商品 -->
          <router-link 
            :to="`/edit-product/${product.id}`"
            class="btn-primary w-full text-center"
          >
            編輯商品
          </router-link>
          <!-- 將商品狀態切換為上架中 -->
          <button 
            v-if="product.status === ProductStatus.Processing"
            @click="openStatusConfirmModal(ProductStatus.Active)"
            class="btn-warning w-full"
          >
            從交易中切換回上架中
          </button>
          <!-- 將商品狀態切換為交易中 -->
          <button 
            v-if="product.status === ProductStatus.Active"
            @click="openStatusConfirmModal(ProductStatus.Processing)"
            class="btn-success w-full"
          >
            切換為交易中
          </button>
          <!-- 下架商品 -->
          <button 
            v-if="product.status !== ProductStatus.Inactive"
            @click="openStatusConfirmModal(ProductStatus.Inactive)"
            class="btn-error w-full"
          >
            下架商品
          </button>
          <!-- 重新上架 -->
          <button 
            v-if="product.status === ProductStatus.Inactive"
            @click="openStatusConfirmModal(ProductStatus.Active)"
            class="btn-error w-full"
          >
            重新上架
          </button>
        </div>

        <div class="text-sm text-gray-500">
          上架時間: {{ formatDate(product.created_at) }}
        </div>

        <!-- 免責聲明 -->
        <div class="w-full">
          <Declaration />
        </div>
      </div>
    </div>
    </div>

  <!-- 狀態確認彈窗 -->
  <div v-if="statusConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg">
      <h2 class="text-lg font-bold text-gray-900 mb-4">確認狀態變更</h2>
      <p class="text-gray-600 mb-4">
        確認
        <span v-if="newStatus === ProductStatus.Processing">
          切換為交易中
        </span>
        <span v-else-if="newStatus === ProductStatus.Inactive">
          下架商品
        </span>
        <span v-else>
          重新上架
        </span>
        ?
      </p>
      <div class="flex justify-end">
        <button 
          @click="statusConfirmModal = false"
          class="btn-secondary mr-2"
        >
          取消
        </button>
        <button 
          @click="handleStatusChange(newStatus)"
          class="btn-primary"
        >
          確認
        </button>
      </div>
    </div>
  </div>

  <!-- 燈箱效果 -->
  <div 
    v-if="lightboxOpen" 
    class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
    @click="closeLightbox"
  >
    <!-- 關閉按鈕 -->
    <button 
      @click="closeLightbox"
      class="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors z-10"
    >
      <Icon name="x-mark" size="xl" color="white" class="mt-2 mr-2" />
    </button>
    <!-- 燈箱內容 -->
    <div class="relative max-w-4xl max-h-full p-4" @click.stop>
      <!-- 圖片容器 -->
      <div class="relative flex items-start">
        <!-- 圖片水平靠上 -->
        <img 
          :src="currentLightboxImage" 
          :alt="`${product.title} - 圖片 ${currentImageIndex + 1}`"
          class="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        
        <!-- 導航箭頭 -->
        <button 
          v-if="product.images.length > 1"
          @click="previousImage"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
          :class="{ 'opacity-50 cursor-not-allowed': currentImageIndex === 0 }"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button 
          v-if="product.images.length > 1"
          @click="nextImage"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
          :class="{ 'opacity-50 cursor-not-allowed': currentImageIndex === product.images.length - 1 }"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <!-- 圖片計數器 -->
      <div v-if="product.images.length > 1" class="text-center mt-4 text-white">
        {{ currentImageIndex + 1 }} / {{ product.images.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import { useIndexStore } from '@/stores/index'
import { useTradeType } from '@/composables/useTradeType'
import { useProductStatus } from '@/composables/useProductStatus'
import { TradeType } from '@/ts/index.enums'
import Layout from '@/components/Layout.vue'
import Icon from '@/components/Icon.vue'
import Declaration from '@/components/Declaration.vue'
import { getProductImageUrl, getAvatarUrl } from '@/utils/imageUrl'

const route = useRoute()
const authStore = useAuthStore()
const productsStore = useProductsStore()
const indexStore = useIndexStore()
const statusConfirmModal = ref(false)
const newStatus = ref(null)

const product = computed(() => productsStore.currentProduct)

// 使用交易类型 composable
const { tradeTypeClass, tradeTypeText, shouldShowPrice } = useTradeType(
  computed(() => product.value?.trade_type)
)

// 使用商品状态 composable - 使用computed确保响应式更新
const { productStatusText, productStatusClass } = useProductStatus(
  computed(() => product.value?.status)
)

const isProductOwner = computed(() => {
  return product.value?.user_id === authStore.user?.id
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const openStatusConfirmModal = (status) => {
  statusConfirmModal.value = true
  newStatus.value = status
}

const handleStatusChange = async (newStatus) => {
  if (!product.value) return
  
  await productsStore.updateProductStatus(product.value.id, newStatus)
  statusConfirmModal.value = false
}

// 燈箱效果狀態
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)
const currentLightboxImage = ref('')

const openLightbox = (index) => {
  currentImageIndex.value = index
  currentLightboxImage.value = product.value.images[index]
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
}

const previousImage = () => {
  if (product.value.images.length > 1) {
    currentImageIndex.value = (currentImageIndex.value - 1 + product.value.images.length) % product.value.images.length
    currentLightboxImage.value = product.value.images[currentImageIndex.value]
  }
}

const nextImage = () => {
  if (product.value.images.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % product.value.images.length
    currentLightboxImage.value = product.value.images[currentImageIndex.value]
  }
}

const openTelegramLink = (telegramUsername, product) => {
  const link = getTelegramLink(telegramUsername, product)
  window.open(link, '_blank')
}

onMounted(async () => {
  const productId = route.params.id
  await productsStore.fetchProduct(productId)
})

// 鍵盤快捷鍵
const handleKeydown = (event) => {
  if (!lightboxOpen.value) return
  
  switch (event.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowLeft':
      if (product.value.images.length > 1) {
        previousImage()
      }
      break
    case 'ArrowRight':
      if (product.value.images.length > 1) {
        nextImage()
      }
      break
  }
}
</script>

<style scoped>
/* 强制限制 Swiper 容器宽度 */
.swiper {
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
}

/* 强制限制每个 slide 的宽度 */
.swiper-slide {
  width: 100% !important;
  max-width: 100% !important;
  flex-shrink: 0 !important;
  flex-grow: 0 !important;
}

/* 主轮播图样式 - 强制宽度控制 */
.swiper:first-child {
  width: 100% !important;
  height: 24rem !important; /* h-96 = 24rem */
  max-width: 100% !important;
}

/* 确保图片在容器内正确显示 */
.swiper-slide img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  max-width: 100% !important;
}

/* 强制隐藏超出容器的内容 */
.swiper-wrapper {
  width: 100% !important;
  max-width: 100% !important;
}

/* 确保导航按钮正确显示 */
.swiper-button-next,
.swiper-button-prev {
  z-index: 10 !important;
}

/* 确保分页器正确显示 */
.swiper-pagination {
  z-index: 10 !important;
}
</style>

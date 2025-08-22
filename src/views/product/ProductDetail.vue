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
              :src="product.images[0]" 
              :alt="`${product.title} - 主圖`"
              class="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <!-- 主輪播圖 -->
          <!-- <swiper
            v-if="isSwiperReady"
            :modules="[SwiperNavigation, SwiperPagination]"
            :slides-per-view="1"
            :space-between="10"
            :centered-slides="true"
            :navigation="true"
            :pagination="{ clickable: true }"
            :width="600"
            :allow-touch-move="true"
            class="w-full h-96 rounded-lg overflow-hidden"
            @swiper="onMainSwiperInit"
          >
            <swiper-slide v-for="(image, index) in product.images" :key="index" class="flex justify-center items-start">
              <img 
                :src="image" 
                :alt="`${product.title} - 圖片 ${index + 1}`"
                class="h-96 object-cover"
              />
            </swiper-slide>
          </swiper> -->
          
          <!-- 縮圖 -->
          <div v-if="product.images.length > 1" class="w-full flex flex-wrap gap-2">
            <div v-for="(image, index) in product.images" :key="index" class="w-1/3">
              <img 
                :src="image" 
                :alt="`${product.title} - 縮略圖 ${index + 1}`"
                class="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                @click="openLightbox(index)"
              />
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

        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">商品描述</h3>
          <p class="text-gray-600">{{ product.description || '無描述' }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-sm font-medium text-gray-500">狀態</span>
            <p class="text-gray-900">
              <span class="text-xs text-white px-2 py-1" :class="productStatusBgClass">
                {{ productStatusText }}
              </span>
            </p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">分類</span>
            <p class="text-gray-900">{{ product.category }}</p>
          </div>
        </div>

        <div>
          <span class="text-sm font-medium text-gray-500">賣家資訊</span>
          <div class="mt-2 flex items-center space-x-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ product.seller_name }}</p>
              <p v-if="product.seller_telegram" class="text-sm text-gray-500">
                Telegram: 
                <a 
                  :href="getTelegramLink(product.seller_telegram, product)" 
                  target="_blank" 
                  class="text-primary-600 hover:underline"
                  title="點擊後會自動填入商品信息，方便與賣家溝通"
                >
                  @{{ product.seller_telegram }}
                </a>
                <span class="text-xs text-gray-400 ml-1">(點擊自動填入商品信息)</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div v-if="authStore.isAuthenticated && isProductOwner" class="space-y-3 flex flex-col gap-2">
          <!-- 編輯商品 -->
          <router-link 
            :to="`/edit-product/${product.id}`"
            class="btn-primary w-full text-center"
          >
            編輯商品
          </router-link>
          <!-- 下架商品 -->
          <button 
            @click="openStatusConfirmModal"
            class="btn-secondary w-full"
          >
            {{ product.status === 'active' ? '下架商品' : '重新上架' }}
          </button>
        </div>

        <div class="text-sm text-gray-500">
          上架時間: {{ formatDate(product.created_at) }}
        </div>
      </div>
    </div>
    </div>

  <!-- 狀態確認彈窗 -->
  <div v-if="statusConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg">
      <h2 class="text-lg font-bold text-gray-900 mb-4">確認狀態變更</h2>
      <p class="text-gray-600 mb-4">
        確認{{ product.status === ProductStatus.Active ? '下架商品' : '重新上架' }}?
      </p>
      <div class="flex justify-end">
        <button 
          @click="statusConfirmModal = false"
          class="btn-secondary mr-2"
        >
          取消
        </button>
        <button 
          @click="handleStatusChange"
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
import { computed, onMounted, ref, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import { ProductStatus } from '@/ts/index.enums'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Icon from '@/components/Icon.vue'
import { useTradeType } from '@/composables/useTradeType'
import { useProductStatus } from '@/composables/useProductStatus'
import { getTelegramLink } from '@/composables/useTelegramLink'

const route = useRoute()
const authStore = useAuthStore()
const productsStore = useProductsStore()
const statusConfirmModal = ref(false)

// Swiper 模組
const SwiperNavigation = Navigation
const SwiperPagination = Pagination

// Swiper 状态管理
const isSwiperReady = ref(false)

const product = computed(() => productsStore.currentProduct)

// 使用交易类型 composable
const { tradeTypeClass, tradeTypeText, shouldShowPrice } = useTradeType(
  computed(() => product.value?.trade_type)
)

// 使用商品状态 composable - 使用computed确保响应式更新
const { productStatusText, productStatusBgClass } = useProductStatus(
  computed(() => product.value?.status)
)

const isProductOwner = computed(() => {
  return product.value?.user_id === authStore.user?.id
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const openStatusConfirmModal = () => {
  statusConfirmModal.value = true
}

const handleStatusChange = async () => {
  if (!product.value) return
  
  const newStatus = product.value.status === ProductStatus.Active ? ProductStatus.Inactive : ProductStatus.Active
  await productsStore.updateProductStatus(product.value.id, newStatus)
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

onMounted(async () => {
  const productId = route.params.id
  await productsStore.fetchProduct(productId)
  
  // 等待 DOM 渲染完成后再初始化 Swiper
  await nextTick()
  if (product.value?.images && product.value.images.length > 0) {
    isSwiperReady.value = true
  }
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 键盘快捷键处理
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

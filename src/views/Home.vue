<template>
    <!-- 英雄區塊 -->
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">
        歡迎來到風格妍究社 - 二手交換平台
      </h2>
      <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        在這裡，您可以輕鬆地與同事交換或購買二手物品，讓資源得到更好的利用。
      </p>
      <!-- <p class="text-gray-600 text-lg mb-4 italic">別讓你的寶貝，躺在角落裡發霉。</p> -->
      <div class="flex justify-center space-x-4">
        <router-link 
          to="/products" 
          class="btn-primary text-lg px-8 py-3"
        >
          開始瀏覽
        </router-link>
        <router-link 
          v-if="authStore.isAuthenticated"
          to="/add-product" 
          class="btn-secondary text-lg px-8 py-3"
        >
          上架商品
        </router-link>
      </div>
    </div>

    <!-- 功能特色 -->
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      <div class="bg-white rounded-lg p-6 text-center border border-gray-100">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="shopping-cart" class="w-8 h-8" color="primary" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">快速交易</h3>
        <p class="text-gray-600">透過Telegram直接聯繫賣家，無須註冊即可快速購買商品</p>
      </div>
      
      <div class="bg-white rounded-lg p-6 text-center border border-gray-100">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">輕鬆上架</h3>
        <p class="text-gray-600">簡單幾步即可上架您的二手物品 (需註冊)，支援多張圖片上傳</p>
      </div>
      
      <div class="bg-white rounded-lg p-6 text-center border border-gray-100">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">安全交易</h3>
        <p class="text-gray-600">公司內部平台，同事間直接聯繫，安全可靠</p>
      </div>
    </div>
    <!-- 最新商品 -->
    <div v-if="productsStore.products.length > 0">
      <h3 class="text-2xl font-bold text-gray-900 mb-6">最新上架</h3>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="product in latestProducts" 
          :key="product.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer relative"
          @click="$router.push(`/products/${product.id}`)"
        >
          <ProductStatusTag :status="product.status" />
          <!-- 商品圖片 -->
          <div v-if="product.images && product.images.length > 0" class="w-full h-48">
            <img 
              :src="getProductImageUrl(product.images[0])" 
              :alt="product.title"
              class="w-full h-48 object-cover rounded-lg mb-4"
            />
          </div>
          <div v-else class="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            <span class="text-gray-400 text-sm">無圖片</span>
          </div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ product.title }}</h4>
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
      
      <div class="text-center mt-8">
        <router-link to="/products" class="btn-primary">
          查看更多商品
        </router-link>
      </div>

      
      <!-- Bug 回報按鈕 -->
      <div class="text-center mt-8">
        <button 
          @click="openBugReport"
          class="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <Icon name="exclamation-triangle" class="w-5 h-5" />
          發現問題？回報 Bug
        </button>
      </div>

    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import { useTradeType } from '@/composables/useTradeType'
import { TradeType } from '@/ts/index.enums'
import ProductStatusTag from '@/components/ProductStatusTag.vue'
import Icon from '@/components/Icon.vue'
import { getProductImageUrl } from '@/utils/imageUrl'

const authStore = useAuthStore()
const productsStore = useProductsStore()

const latestProducts = computed(() => {
  return productsStore.products.slice(0, 6)
})

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await authStore.fetchUser()
  }
  await productsStore.fetchProducts()
})

const getTradeTypeClass = (tradeType) => {
  const { tradeTypeClass } = useTradeType(ref(tradeType))
  return tradeTypeClass.value
}

const getTradeTypeText = (tradeType) => {
  const { tradeTypeText } = useTradeType(ref(tradeType))
  return tradeTypeText.value
}

const openBugReport = () => {
  const telegramUrl = 'https://t.me/ParkerDuTW'
  window.open(telegramUrl, '_blank')
}

</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-bo x;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

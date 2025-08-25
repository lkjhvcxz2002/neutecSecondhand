<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">編輯商品</h1>
      
      <div v-if="productsStore.loading" class="text-center py-12">
        <div class="text-gray-500">載入中...</div>
      </div>
      
      <div v-else-if="!product" class="text-center py-12">
        <div class="text-gray-500">商品不存在</div>
      </div>
      
      <div v-else class="card">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">
              商品標題 * 
              <span class="text-xs text-gray-500 ml-2">
                ({{ form.title.length }}/40)
              </span>
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              maxlength="40"
              class="input-field mt-1"
              placeholder="請輸入商品標題"
            />
            <div class="text-xs text-gray-500 mt-1">
              剩餘 {{ 40 - form.title.length }} 字
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">
              商品描述
              <span class="text-xs text-gray-500 ml-2">
                ({{ form.description.length }}/300)
              </span>
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              maxlength="300"
              class="input-field mt-1"
              placeholder="請描述您的商品..."
            ></textarea>
            <div class="text-xs text-gray-500 mt-1">
              剩餘 {{ 300 - form.description.length }} 字
            </div>
          </div>

          
          <!-- 交易方式: 贈送、交換、買賣-->
          <div>
            <label for="trade-type" class="block text-sm font-medium text-gray-700">交易方式 *</label>
            <select v-model="form.tradeType" @change="handleTradeTypeChange" required class="input-field mt-1">
              <option value="">請選擇交易方式</option>
              <option value="買賣">買賣</option>
              <option value="贈送">贈送</option>
              <option value="交換">交換 (方法請備註於商品描述內)</option>
            </select>
          </div>

          <!-- 價格、分類 -->
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700">價格 (NT$) *</label>
              <input
                id="price"
                :disabled="disabledPrice"
                v-model.number="form.price"
                type="number"
                min="0"
                required
                class="input-field mt-1"
                placeholder="0"
              />
            </div>

            <CategorySelect v-model="form.category" />
            <!-- <div>
              <label for="category" class="block text-sm font-medium text-gray-700">分類 *</label>
              <select v-model="form.category" required class="input-field mt-1">
                <option value="">請選擇分類</option>
                <option value="電子產品">電子產品</option>
                <option value="服飾">服飾</option>
                <option value="書籍">書籍</option>
                <option value="家具">家具</option>
                <option value="其他">其他</option>
              </select>
            </div> -->
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">商品圖片</label>
            <div class="mt-1">
              <input
                type="file"
                @change="handleImageChange"
                accept="image/*"
                multiple
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p class="mt-1 text-sm text-gray-500">最多可上傳 5 張圖片，支援 JPG、PNG、GIF 格式</p>
            </div>
            
            <!-- 現有圖片 -->
            <div v-if="product.images && product.images.length > 0" class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">現有圖片</h4>
              <div class="grid grid-cols-5 gap-2">
                <div 
                  v-for="(image, index) in product.images" 
                  :key="index"
                  class="relative"
                >
                  <img 
                    :src="getProductImageUrl(image)" 
                    alt="商品圖片"
                    class="w-full h-24 object-cover rounded"
                  />
                </div>
              </div>
            </div>
            
            <!-- 新上傳的圖片預覽 -->
            <div v-if="newImages.length > 0" class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">新上傳的圖片</h4>
              <div class="grid grid-cols-5 gap-2">
                <div 
                  v-for="(preview, index) in imagePreview" 
                  :key="index"
                  class="relative"
                >
                  <img 
                    :src="getProductImageUrl(preview)" 
                    alt="預覽圖片"
                    class="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    @click="removeNewImage(index)"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <router-link :to="`/products/${product.id}`" class="btn-secondary">
              取消
            </router-link>
            <button
              type="submit"
              :disabled="productsStore.loading || !isFormValid"
              class="btn-primary disabled:opacity-50"
            >
              <span v-if="productsStore.loading">更新中...</span>
              <span v-else>更新商品</span>
            </button>
          </div>
        </form>

        <!-- 訊息 -->
        <div v-if="message" class="mt-4 p-3 rounded" :class="messageClass">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { TradeType } from '@/ts/index.enums'
import CategorySelect from '@/components/CategorySelect.vue'
import { getProductImageUrl } from '@/utils/imageUrl'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

const product = computed(() => productsStore.currentProduct)

const form = ref({
  title: '',
  description: '',
  price: '',
  category: '',
  tradeType: ''
})

const newImages = ref([])
const imagePreview = ref([])
const message = ref('')
const messageType = ref('')

// 交易方式為贈送或交換時，價格不可輸入
const disabledPrice = computed(() => {
  return form.value.tradeType === TradeType.Gift || form.value.tradeType === TradeType.Exchange
})

const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-100 border border-green-400 text-green-700'
    : 'bg-red-100 border border-red-400 text-red-700'
})

const isFormValid = computed(() => {
  return form.value.title.trim() && 
         form.value.price > 0 && 
         form.value.category
})

const handleImageChange = (event) => {
  const files = Array.from(event.target.files)
  
  // 限制圖片數量
  if (newImages.value.length + files.length > 5) {
    alert('最多只能上傳 5 張圖片')
    return
  }
  
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      newImages.value.push(file)
      
      // 建立預覽
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeNewImage = (index) => {
  newImages.value.splice(index, 1)
  imagePreview.value.splice(index, 1)
}

const handleSubmit = async () => {
  message.value = ''
  
  const productData = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    price: form.value.price,
    category: form.value.category,
    trade_type: form.value.tradeType,
    images: newImages.value
  }
  
  const result = await productsStore.updateProduct(product.value.id, productData)
  
  if (result.success) {
    message.value = '商品更新成功！正在跳轉...'
    messageType.value = 'success'
    setTimeout(() => {
      router.push(`/products/${product.value.id}`)
    }, 1500)
  } else {
    message.value = result.message
    messageType.value = 'error'
  }
}

onMounted(async () => {
  const productId = route.params.id
  await productsStore.fetchProduct(productId)
  
  if (product.value) {
    form.value.title = product.value.title || ''
    form.value.description = product.value.description || ''
    form.value.price = product.value.price || ''
    form.value.category = product.value.category || ''
    form.value.tradeType = product.value.trade_type || ''
  }
})
</script>

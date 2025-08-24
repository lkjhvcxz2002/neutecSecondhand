<template>
  <div class="min-h-screen">
      <h1 class="page-title">上架新商品</h1>
      <div class="w-full"> 
        <Declaration />
      </div>
      <div class="card mt-4">
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
              <option value="買賣">買賣</option>
              <option value="贈送">贈送</option>
              <option value="交換">交換 (方法請備註於商品描述內)</option>
            </select>
          </div>
          
          <!-- 商品價格 -->
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700">
                價格 (NT$) 
                <span v-if="form.tradeType === TradeType.Sell" class="text-red-500">*</span>
                <span v-else class="text-gray-400">(選填)</span>
              </label>
              <input
                id="price"
                :disabled="disabledPrice"
                v-model.number="form.price"
                type="number"
                min="0"
                :required="form.tradeType === TradeType.Sell"
                class="input-field mt-1"
                :placeholder="form.tradeType === TradeType.Sell ? '請輸入價格' : '0'"
              />
              <p v-if="form.tradeType !== TradeType.Sell" class="mt-1 text-sm text-gray-500">
                贈送或交換商品無需設定價格，請在商品描述中說明。
              </p>
            </div>

            <CategorySelect v-model="form.category" />
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
            
            <!-- 預覽圖片 -->
            <div v-if="imagePreview.length > 0" class="mt-4 grid grid-cols-5 gap-2">
              <div 
                v-for="(preview, index) in imagePreview" 
                :key="index"
                class="relative"
              >
                <img 
                  :src="preview" 
                  alt="預覽圖片"
                  class="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <router-link to="/products" class="btn-secondary">
              取消
            </router-link>
            <button
              type="submit"
              :disabled="productsStore.loading || !isFormValid"
              class="btn-primary disabled:opacity-50"
            >
              <span v-if="productsStore.loading">上架中...</span>
              <span v-else>上架商品</span>
            </button>
          </div>
        </form>

        <!-- 訊息 -->
        <div v-if="message" class="mt-4 p-3 rounded" :class="messageClass">
          {{ message }}
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { TradeType } from '@/ts/index.enums'
import CategorySelect from '@/components/CategorySelect.vue'
import Declaration from '@/components/Declaration.vue'

const router = useRouter()
const productsStore = useProductsStore()

const form = ref({
  title: '',
  description: '',
  price: '',
  category: '',
  tradeType: TradeType.Sell,
  images: []
})

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
  const baseValidation = form.value.title.trim() && 
                        form.value.category &&
                        form.value.tradeType
  
  // 如果是出售类型，需要驗證價格
  if (form.value.tradeType === TradeType.Sell) {
    return baseValidation && form.value.price > 0
  }
  
  // 其他交易类型不需要驗證價格
  return baseValidation
})

const handleImageChange = (event) => {
  const files = Array.from(event.target.files)
  
  // 限制圖片數量
  if (form.value.images.length + files.length > 5) {
    alert('最多只能上傳 5 張圖片')
    return
  }
  
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      form.value.images.push(file)
      
      // 建立預覽
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeImage = (index) => {
  form.value.images.splice(index, 1)
  imagePreview.value.splice(index, 1)
}

const handleTradeTypeChange = () => {
  if (form.value.tradeType === TradeType.Gift || form.value.tradeType === TradeType.Exchange) {
    form.value.price = ''
  }
}

const handleSubmit = async () => {
  message.value = ''
  
  // 根据交易类型处理价格
  let finalPrice = form.value.price
  if (form.value.tradeType !== TradeType.Sell) {
    finalPrice = 0 // 非出售类型价格设为0
  }
  
  const productData = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    price: finalPrice,
    category: form.value.category,
    tradeType: form.value.tradeType,
    images: form.value.images
  }
  
  const result = await productsStore.createProduct(productData)
  
  if (result.success) {
    message.value = '商品上架成功！正在跳轉...'
    messageType.value = 'success'
    setTimeout(() => {
      router.push(`/products/${result.product.id}`)
    }, 1500)
  } else {
    message.value = result.message
    messageType.value = 'error'
  }
}
</script>

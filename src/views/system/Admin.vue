<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">管理員控制台</h1>
      
      <!-- 訊息顯示 -->
      <div v-if="message" class="fixed top-0 left-0 w-full p-4 rounded-lg" :class="messageClass">
        {{ message }}
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 統計卡片 -->
        <div class="lg:col-span-1 space-y-6">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">系統統計</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">總用戶數</span>
                <span class="font-semibold">{{ state.value.totalUsers || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">總商品數</span>
                <span class="font-semibold">{{ state.value.totalProducts || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">活躍商品</span>
                <span class="font-semibold">{{ state.value.activeProducts || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
            <div class="space-y-3">
              <router-link to="/maintenance" class="btn-primary w-full text-center">
                系統維護
              </router-link>
              <button 
                @click="refreshStats" 
                :disabled="isPageLoading"
                class="btn-secondary w-full disabled:opacity-50"
              >
                <span v-if="isPageLoading">載入中...</span>
                <span v-else>重新整理統計</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 主要內容 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 載入狀態 -->
          <div v-if="isPageLoading" class="text-center py-12">
            <div class="text-gray-500">載入中...</div>
          </div>
          
          <!-- 用戶管理 -->
          <div v-if="!isPageLoading" class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">用戶管理</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用戶</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in adminStore.users.value" :key="user.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <img v-if="user.avatar" :src="getAvatarUrl(user.avatar)" alt="User Avatar" class="w-full h-full object-cover rounded-full"></img>
                          <Icon v-else name="user" class="w-full h-full object-cover rounded-full"></Icon>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                          <div class="text-sm text-gray-500">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="user.status === 'active' ? 'text-green-600' : 'text-red-600'">
                        {{ user.status === 'active' ? '啟用' : '停權' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="user.role === 'admin' ? 'text-purple-600' : 'text-gray-600'">
                        {{ user.role === 'admin' ? '管理員' : '一般用戶' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        v-if="user.id !== authStore.user?.id"
                        @click="toggleUserStatus(user)"
                        :disabled="isPageLoading"
                        :class="user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                        class="mr-3 disabled:opacity-50"
                      >
                        {{ user.status === 'active' ? '停權' : '啟用' }}
                      </button>
                      <!-- <button 
                        v-if="user.id !== authStore.user?.id"
                        @click="toggleUserRole(user)"
                        :disabled="isPageLoading"
                        :class="user.role === 'admin' ? 'text-orange-600 hover:text-orange-900' : 'text-blue-600 hover:text-blue-900'"
                        class="disabled:opacity-50"
                      >
                        {{ user.role === 'admin' ? '取消管理員' : '設為管理員' }}
                      </button> -->
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 商品管理 -->
          <div v-if="!isPageLoading" class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">商品管理</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">賣家</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="product in adminStore.products.value" :key="product.id">
                    <td class="px-6 py-4 whitespace-nowrap max-w-40">
                      <div class="flex items-center">
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 max-w-32 truncate" :title="product.title">
                            {{ product.title.length > 10 ? product.title.substring(0, 10) + '...' : product.title }}
                          </div>
                          <div class="text-sm text-gray-500">NT$ {{ product.price }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ product.seller_name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="product.status === ProductStatus.Inactive ? 'text-red-600' : 'text-green-600'">
                        {{ product.status === ProductStatus.Inactive ? '已下架' : '上架中' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        @click="toggleProductStatus(product)"
                        :disabled="isPageLoading"
                        :class="product.status === ProductStatus.Inactive ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'"
                        class="disabled:opacity-50"
                      >
                        {{ product.status === ProductStatus.Inactive ? '上架' : '下架' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import Icon from '@/components/Icon.vue'
import { ProductStatus } from '@/ts/index.enums'
import { getAvatarUrl } from '@/utils/imageUrl'

const authStore = useAuthStore()
const adminStore = useAdminStore()

const message = ref('')
const messageType = ref('')

// 顯示訊息
const showMessage = (text, type) => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}

const state = computed(() => {
  return adminStore.stats
})

const isPageLoading = computed(() => {
  return adminStore.loading.value
})

// 計算訊息樣式
const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-100 border border-green-400 text-green-700'
    : 'bg-red-100 border border-red-400 text-red-700'
})

// 重新整理統計
const refreshStats = async () => {
  const result = await adminStore.refreshAll()
  showMessage(result.message, result.success ? 'success' : 'error')
}

// 切換用戶狀態
const toggleUserStatus = async (user) => {
  const result = await adminStore.toggleUserStatus(user.id, user.status)
  showMessage(result.message, result.success ? 'success' : 'error')
}

// 切換用戶角色
const toggleUserRole = async (user) => {
  const result = await adminStore.toggleUserRole(user.id, user.role)
  showMessage(result.message, result.success ? 'success' : 'error')
}

// 切換商品狀態
const toggleProductStatus = async (product) => {
  const result = await adminStore.toggleProductStatus(product.id, product.status)
  showMessage(result.message, result.success ? 'success' : 'error')
}

onMounted(async () => {
  await adminStore.refreshAll()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">管理員控制台</h1>
      
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- 統計卡片 -->
        <div class="lg:col-span-1 space-y-6">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">系統統計</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">總用戶數</span>
                <span class="font-semibold">{{ stats.totalUsers || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">總商品數</span>
                <span class="font-semibold">{{ stats.totalProducts || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">活躍商品</span>
                <span class="font-semibold">{{ stats.activeProducts || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
            <div class="space-y-3">
              <router-link to="/maintenance" class="btn-primary w-full text-center">
                系統維護
              </router-link>
              <button @click="refreshStats" class="btn-secondary w-full">
                重新整理統計
              </button>
            </div>
          </div>
        </div>

        <!-- 主要內容 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 用戶管理 -->
          <div class="card">
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
                  <tr v-for="user in users" :key="user.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
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
                        :class="user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                        class="mr-3"
                      >
                        {{ user.status === 'active' ? '停權' : '啟用' }}
                      </button>
                      <button 
                        v-if="user.id !== authStore.user?.id"
                        @click="toggleUserRole(user)"
                        :class="user.role === 'admin' ? 'text-orange-600 hover:text-orange-900' : 'text-blue-600 hover:text-blue-900'"
                      >
                        {{ user.role === 'admin' ? '取消管理員' : '設為管理員' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 商品管理 -->
          <div class="card">
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
                  <tr v-for="product in products" :key="product.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img 
                          :src="product.images?.[0] || '/placeholder.jpg'" 
                          :alt="product.title"
                          class="w-10 h-10 object-cover rounded"
                        />
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ product.title }}</div>
                          <div class="text-sm text-gray-500">NT$ {{ product.price }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ product.seller_name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="product.status === 'active' ? 'text-green-600' : 'text-red-600'">
                        {{ product.status === 'active' ? '上架中' : '已下架' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        @click="toggleProductStatus(product)"
                        :class="product.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                      >
                        {{ product.status === 'active' ? '下架' : '上架' }}
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const users = ref([])
const products = ref([])
const stats = ref({})

const refreshStats = async () => {
  // 這裡應該調用 API 獲取統計資料
  console.log('重新整理統計')
}

const toggleUserStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'suspended' : 'active'
  // 這裡應該調用 API 更新用戶狀態
  console.log(`切換用戶 ${user.id} 狀態為 ${newStatus}`)
}

const toggleUserRole = async (user) => {
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  // 這裡應該調用 API 更新用戶角色
  console.log(`切換用戶 ${user.id} 角色為 ${newRole}`)
}

const toggleProductStatus = async (product) => {
  const newStatus = product.status === 'active' ? 'inactive' : 'active'
  // 這裡應該調用 API 更新商品狀態
  console.log(`切換商品 ${product.id} 狀態為 ${newStatus}`)
}

onMounted(() => {
  // 這裡應該調用 API 獲取初始資料
  console.log('管理員頁面載入完成')
})
</script>

<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="text-md font-bold text-primary-600 sm:text-2xl">
            二手交換平台
          </router-link>
        </div>
        
        <div class="flex items-center space-x-4">
          <router-link 
            to="/products" 
            class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
          >
            <Icon v-if="indexStore.isMobile" name="shopping-cart" size="sm" />
            <span v-else>
              瀏覽商品
            </span>
          </router-link>
          
          <template v-if="!authStore.isAuthenticated">
            <router-link 
              to="/login" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <Icon v-if="indexStore.isMobile" name="user-circle" size="md" />
              <span v-else>
                登入
              </span>
            </router-link>
            <router-link 
              to="/register" 
              class="btn-primary"
            >
              <Icon v-if="indexStore.isMobile" name="user-plus" size="sm" />
              <span v-else>
                註冊
              </span>
            </router-link>
          </template>
          
          <template v-else>
            <router-link 
              to="/add-product" 
              class="btn-primary"
            >
              <Icon v-if="indexStore.isMobile" name="plus" size="md" />
              <span v-else>
                上架商品
              </span>
            </router-link>
            <router-link 
              to="/profile" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <Icon v-if="indexStore.isMobile" name="user-circle" size="md" />
              <span v-else>
                個人資料
              </span>
            </router-link>
            <button 
              @click="authStore.logout" 
              class="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <Icon v-if="indexStore.isMobile" name="arrow-right-start-on-rectangle" size="md" />
              <span v-else>
                登出
              </span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import Icon from './Icon.vue'
import { useIndexStore } from '@/stores/index'

const authStore = useAuthStore()
const indexStore = useIndexStore()
</script>

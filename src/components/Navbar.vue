<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="!indexStore.isAccessDenied" class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="text-md font-bold text-primary-600 sm:text-2xl">
            二手交換平台
          </router-link>
          <!-- 管理員 -->
          <div v-if="authStore.isAdmin" class="flex items-center space-x-4">
            <router-link 
              to="/admin" 
              class="text-gray-700 hover:text-primary-600 md:px-3 py-2 rounded-md text-sm font-medium"
            >
              <Icon name="user-circle" size="md" />
            </router-link>
          </div>
        </div>
        
        <!-- 導覽列 -->
        <div v-if="!maintenanceStore.maintenanceMode.value" class="flex items-center space-x-4">
          <router-link 
            to="/products" 
            class="text-gray-700 hover:text-primary-600 md:px-3 py-2 rounded-md text-sm font-medium"
          >
            <Tooltip v-if="indexStore.isMobile" text="瀏覽商品" position="bottom">
              <Icon name="shopping-cart" size="sm" />
            </Tooltip>
            <span v-else>
              瀏覽商品
            </span>
          </router-link>
          
          <!-- 未登入 -->
          <template v-if="!authStore.isAuthenticated">
            <router-link 
              to="/login" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
            <Tooltip v-if="indexStore.isMobile" text="登入" position="bottom">
              <Icon name="user-circle" size="md" />
            </Tooltip>
              <span v-else>
                登入
              </span>
            </router-link>
            <router-link 
              to="/register" 
              class="btn-primary"
            >
            <Tooltip v-if="indexStore.isMobile" text="註冊" position="bottom">
              <Icon name="user-plus" size="sm" />
            </Tooltip>
              <span v-else>
                註冊
              </span>
            </router-link>
          </template>
          
          <!-- 登入後 -->
          <template v-else>
            <router-link 
              to="/add-product" 
              class="btn-primary"
            >
              <Tooltip v-if="indexStore.isMobile" text="上架商品" position="bottom">
                <Icon name="plus" size="md" />
              </Tooltip>
              <span v-else>
                上架商品
              </span>
            </router-link>
            <router-link 
              to="/my-products" 
              class="text-gray-700 hover:text-primary-600 md:px-3 py-2 rounded-md text-sm font-medium"
            >
              <Tooltip v-if="indexStore.isMobile" text="我的商品" position="bottom">
                <Icon name="shopping-bag" size="md" />
              </Tooltip>
              <span v-else>
                我的商品
              </span>
            </router-link>
            <router-link 
              to="/profile" 
              class="text-gray-700 hover:text-primary-600 md:px-3 py-2 rounded-md text-sm font-medium"
            >
              <Tooltip v-if="indexStore.isMobile" text="個人資料" position="bottom">
                <Icon name="user-circle" size="md" />
              </Tooltip>
              <span v-else>
                個人資料
              </span>
            </router-link>
            <button 
              @click="authStore.logout" 
              class="text-gray-700 hover:text-red-600 md:px-3 py-2 rounded-md text-sm font-medium"
            >
              <Tooltip v-if="indexStore.isMobile" text="登出" position="bottom">
                <Icon name="arrow-right-start-on-rectangle" size="md" />
              </Tooltip>
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
import { useIndexStore } from '@/stores/index'
import Tooltip from '@/components/Tooltip.vue'
import Icon from '@/components/Icon.vue'
import { useMaintenanceStore } from '@/stores/maintenance'

const authStore = useAuthStore()
const indexStore = useIndexStore()
const maintenanceStore = useMaintenanceStore()
</script>

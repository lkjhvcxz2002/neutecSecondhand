<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- 404 圖示 -->
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
          <Icon name="exclamation-triangle" class="w-12 h-12 text-white" />
        </div>
      </div>
      
      <!-- 標題 -->
      <h1 class="text-6xl font-bold text-gray-900 mb-4">
        404
      </h1>
      
      <!-- 副標題 -->
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">
        頁面未找到
      </h2>
      
      <!-- 描述 -->
      <p class="text-gray-600 text-lg mb-8">
        抱歉，您要尋找的頁面不存在。<br>
        可能是網址輸入錯誤，或者頁面已被移除。
      </p>
      
      <!-- 操作按鈕 -->
      <div class="space-y-4">
        <button 
          @click="goBack"
          class="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
        >
          返回上一頁
        </button>
        
        <router-link 
          to="/"
          class="block w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
        >
          回到首頁
        </router-link>
      </div>
      
      <!-- 幫助提示 -->
      <div class="mt-8 text-gray-500 text-sm">
        <p>如果您認為這是系統錯誤，請聯繫管理員</p>
        <p class="mt-2">
          <a 
            href="https://t.me/ParkerDuTW" 
            target="_blank"
            class="text-primary-600 hover:text-primary-700 transition-colors"
          >
            @ParkerDuTW
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'

const router = useRouter()

// 返回上一頁
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

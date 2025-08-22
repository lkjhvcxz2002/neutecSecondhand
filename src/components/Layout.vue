<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 導航欄 -->
    <Navbar />
    
    <!-- 主要內容 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue'
</script>

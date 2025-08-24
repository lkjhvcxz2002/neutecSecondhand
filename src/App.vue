<template>
  <!-- <div style="position: fixed; top: 0; left: 0; background-color: red; z-index: 1000;">
    isMobile: {{ indexStore.isMobile }} <br>
    isTablet: {{ indexStore.isTablet }} <br>
    isDesktop: {{ indexStore.isDesktop }} <br>
    screenWidth: {{ indexStore.screenWidth }} <br>
  </div> -->
  <div id="app" class="min-h-screen bg-gray-50">
    <Layout>
      <router-view />
    </Layout>
  </div>
</template>

<script setup>
import Layout from '@/components/Layout.vue'
import { useIndexStore } from '@/stores/index'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

// 主應用組件
onMounted(async () => {
  await authStore.fetchUser()
})
</script>

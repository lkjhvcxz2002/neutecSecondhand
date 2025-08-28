<template>
  <div class="access-denied-container">
    <div class="access-denied-content">
      <h1>🚫 訪問被拒絕</h1>
      <p>您的 IP 地址不在允許訪問的白名單中。</p>
      <p>如需協助，請聯繫管理員。</p>
    </div>
  </div>
</template>

<script setup>
import { useMaintenanceStore } from '@/stores/maintenance'

const maintenanceStore = useMaintenanceStore()

maintenanceStore.maintenanceMode.value = true
</script>

<style scoped>
.access-denied-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.access-denied-content {
  text-align: center;
}

.access-denied-content h1 {
  font-size: 24px;
  margin-bottom: 10px;
}   

.access-denied-content p {
  font-size: 16px;
  margin-bottom: 10px;
}
</style>
<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">图标使用指南</h2>
    
    <!-- 基本用法 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">基本用法</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 border rounded-lg">
          <Icon name="home" size="lg" color="primary" />
          <p class="mt-2 text-sm">home</p>
        </div>
        <div class="text-center p-4 border rounded-lg">
          <Icon name="user" size="lg" color="secondary" />
          <p class="mt-2 text-sm">user</p>
        </div>
        <div class="text-center p-4 border rounded-lg">
          <Icon name="cog" size="lg" color="success" />
          <p class="mt-2 text-sm">cog</p>
        </div>
        <div class="text-center p-4 border rounded-lg">
          <Icon name="heart" size="lg" color="danger" />
          <p class="mt-2 text-sm">heart</p>
        </div>
      </div>
    </div>
    
    <!-- 尺寸示例 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">尺寸示例</h3>
      <div class="flex items-center space-x-6">
        <div class="text-center">
          <Icon name="star" size="xs" color="warning" />
          <p class="mt-1 text-xs">xs</p>
        </div>
        <div class="text-center">
          <Icon name="star" size="sm" color="warning" />
          <p class="mt-1 text-xs">sm</p>
        </div>
        <div class="text-center">
          <Icon name="star" size="md" color="warning" />
          <p class="mt-1 text-xs">md</p>
        </div>
        <div class="text-center">
          <Icon name="star" size="lg" color="warning" />
          <p class="mt-1 text-xs">lg</p>
        </div>
        <div class="text-center">
          <Icon name="star" size="xl" color="warning" />
          <p class="mt-1 text-xs">xl</p>
        </div>
      </div>
    </div>
    
    <!-- 常用图标 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">常用图标</h3>
      <div class="grid grid-cols-6 md:grid-cols-8 gap-4">
        <div 
          v-for="icon in commonIcons" 
          :key="icon"
          class="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
          @click="copyIconName(icon)"
        >
          <Icon :name="icon" size="md" />
          <p class="mt-1 text-xs text-gray-600">{{ icon }}</p>
        </div>
      </div>
    </div>
    
    <!-- 使用说明 -->
    <div class="bg-blue-50 p-4 rounded-lg">
      <h3 class="text-lg font-semibold mb-2 text-blue-900">使用方法</h3>
      <div class="space-y-2 text-sm text-blue-800">
        <p><code>&lt;Icon name="home" /&gt;</code> - 基本用法</p>
        <p><code>&lt;Icon name="user" size="lg" color="primary" /&gt;</code> - 指定尺寸和颜色</p>
        <p><code>&lt;Icon name="cog" class="w-8 h-8 text-red-500" /&gt;</code> - 自定义样式</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from './Icon.vue'

// 常用图标列表
const commonIcons = [
  // 基础图标
  'home', 'user', 'cog', 'heart', 'star', 'search', 'plus', 'minus',
  'check', 'x-mark', 'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right',
  
  // 界面图标
  'eye', 'eye-slash', 'lock-closed', 'lock-open', 'key', 'mail', 'phone',
  'calendar', 'clock', 'map-pin', 'document', 'folder', 'image', 'video-camera',
  
  // 功能图标
  'gift', 'shopping-cart', 'credit-card', 'banknotes', 'currency-dollar',
  'chart-bar', 'presentation-chart-line', 'fire', 'bolt', 'sun', 'moon',
  'cloud', 'question-mark-circle',
  
  // 更多常用图标
  'trash', 'pencil', 'user-plus', 'user-circle'
]

// 复制图标名称到剪贴板
const copyIconName = (iconName) => {
  navigator.clipboard.writeText(iconName).then(() => {
    // 可以添加提示
    console.log(`图标名称 "${iconName}" 已复制到剪贴板`)
  })
}
</script>

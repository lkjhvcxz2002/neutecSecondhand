<template>
  <div class="relative inline-block">
    <div 
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      @focus="showTooltip = true"
      @blur="showTooltip = false"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      class="inline-block"
      tabindex="0"
    >
      <slot />
    </div>
    
    <div
      v-if="showTooltip"
      :class="[
        'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap',
        positionClasses[position]
      ]"
      role="tooltip"
    >
      {{ text }}
      <!-- 箭頭 -->
      <div 
        :class="[
          'absolute w-2 h-2 bg-gray-900 transform rotate-45',
          arrowClasses[position]
        ]"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  }
})

const showTooltip = ref(false)
let touchTimer = null

// 處理觸控開始
const handleTouchStart = () => {
  // 清除之前的計時器
  if (touchTimer) {
    clearTimeout(touchTimer)
  }
  
  // 立即顯示 tooltip
  showTooltip.value = true
}

// 處理觸控結束
const handleTouchEnd = () => {
  // 延遲隱藏 tooltip，讓用戶有時間閱讀內容
  touchTimer = setTimeout(() => {
    showTooltip.value = false
  }, 2000) // 2秒後自動隱藏
}

const positionClasses = {
  top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
}

const arrowClasses = {
  top: 'top-full left-1/2 transform -translate-x-1/2',
  bottom: 'bottom-full left-1/2 transform -translate-x-1/2',
  left: 'left-full top-1/2 transform -translate-y-1/2',
  right: 'right-full top-1/2 transform -translate-y-1/2'
}
</script>

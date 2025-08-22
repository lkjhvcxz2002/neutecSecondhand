<template>
    <!-- 商品狀態標籤 - 右上角書籤樣式 -->
    <div class="absolute top-0 right-0 z-10">
        <div 
            class="w-20 h-8 flex items-center justify-center text-xs text-white font-medium shadow-lg rounded-tl-lg"
            :class="productStatusBgClass"
        >
            {{ productStatusText }}
        </div>
        <!-- 書籤尾巴 -->
        <div 
            class="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] ml-auto mr-0"
            :class="productStatusBorderClass"
        ></div>
    </div>
</template>

<script setup>
import { useProductStatus } from '@/composables/useProductStatus'
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

// 使用computed确保响应式更新
const { productStatusText, productStatusBorderClass, productStatusBgClass } = useProductStatus(
  computed(() => props.status)
)
</script>

<style scoped>

/* 商品状态标签样式 */
.status-triangle {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.status-triangle::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 20px solid;
}

.status-text {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  line-height: 1;
}

/* 书签样式状态标签 */
.status-bookmark {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-bookmark .bookmark-tail {
  margin-left: auto;
  margin-right: 0;
}
</style>
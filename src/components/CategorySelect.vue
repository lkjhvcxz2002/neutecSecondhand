<template>
  <div>
    <label for="category" class="block text-sm font-medium text-gray-700">分類 *</label>
    <select :value="props.modelValue" @change="emit('update:modelValue', $event.target.value)" required class="input-field mt-1">
      <option value="">請選擇分類</option>
      <option value="服飾">服飾</option>
      <option value="鞋包">鞋包</option>
      <option value="日常用品">日常用品</option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
</script>
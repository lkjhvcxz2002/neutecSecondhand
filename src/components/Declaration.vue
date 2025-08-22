<template>
  <div class="card mt-2 flex flex-col justify-center sm:mx-auto sm:w-full sm:max-w-md">
    <p class="text-sm text-gray-600">
      <ul class="list-disc list-inside">
        <li>此為公司內部系統，僅供公司員工使用</li>
        <li>若交易過程中發生任何糾紛，公司與福委會皆不會協助協調，且不可使用公司名義發起交易。</li>
        <li>不得由社團或公司名義發起販售交易/盈利活動，當然也不可變賣/轉讓社團資產。</li>
      </ul>
    </p>
    <div v-if="needAgreeButton" class="mt-2 flex justify-center">
      <!-- 我同意按鈕 -->
      <div class="flex items-center" @click="handleAgree">
        <input type="checkbox" :checked="isAgree" />
        <label for="isAgree" class="ml-2 text-sm text-gray-600">我同意</label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  needAgreeButton: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['agree'])

const isAgree = ref(false)

const handleAgree = () => {
  isAgree.value = !isAgree.value
  emit('agree', isAgree.value)
}
</script>
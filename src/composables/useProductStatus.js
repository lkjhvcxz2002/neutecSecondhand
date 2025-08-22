import { computed } from 'vue'
import { ProductStatus } from '@/ts/index.enums'

export function useProductStatus(productStatus) {
  // 商品状态样式映射
  const productStatusClass = computed(() => {
    const classMap = {
      [ProductStatus.Active]: 'text-green-600',
      [ProductStatus.Processing]: 'text-blue-600',
      [ProductStatus.Sold]: 'text-red-600',
      [ProductStatus.Inactive]: 'text-gray-600'
    }
    return classMap[productStatus.value] || 'text-gray-600'
  })

  // 商品状态显示文本映射
  const productStatusText = computed(() => {
    const textMap = {
      [ProductStatus.Active]: '上架中',
      [ProductStatus.Processing]: '交易中',
      [ProductStatus.Sold]: '已售出',
      [ProductStatus.Inactive]: '已下架'
    }
    return textMap[productStatus.value] || '未知'
  })

  // 商品状态边框样式映射（用于倒三角形）
  const productStatusBorderClass = computed(() => {
    const borderMap = {
      [ProductStatus.Active]: 'border-green-500',
      [ProductStatus.Processing]: 'border-blue-500',
      [ProductStatus.Sold]: 'border-red-500',
      [ProductStatus.Inactive]: 'border-gray-500'
    }
    return borderMap[productStatus.value] || 'border-gray-500'
  })

  // 商品状态背景色映射
  const productStatusBgClass = computed(() => {
    const bgMap = {
      [ProductStatus.Active]: 'bg-green-500',
      [ProductStatus.Processing]: 'bg-blue-500',
      [ProductStatus.Sold]: 'bg-red-500',
      [ProductStatus.Inactive]: 'bg-gray-500'
    }
    return bgMap[productStatus.value] || 'bg-gray-500'
  })

  // 检查是否为特定状态
  const isActive = computed(() => productStatus.value === ProductStatus.Active)
  const isProcessing = computed(() => productStatus.value === ProductStatus.Processing)
  const isSold = computed(() => productStatus.value === ProductStatus.Sold)
  const isInactive = computed(() => productStatus.value === ProductStatus.Inactive)

  // 检查是否可编辑
  const isEditable = computed(() => 
    productStatus.value === ProductStatus.Active || 
    productStatus.value === ProductStatus.Inactive
  )

  // 检查是否可下架
  const canToggleStatus = computed(() => 
    productStatus.value === ProductStatus.Active || 
    productStatus.value === ProductStatus.Inactive
  )

  return {
    productStatusClass,
    productStatusText,
    productStatusBorderClass,
    productStatusBgClass,
    isActive,
    isProcessing,
    isSold,
    isInactive,
    isEditable,
    canToggleStatus
  }
}

import { computed } from 'vue'
import { TradeType } from '@/ts/index.enums'

export function useTradeType(tradeType) {
  // 交易类型样式映射
  const tradeTypeClass = computed(() => {
    const classMap = {
      [TradeType.Gift]: 'bg-green-600',
      [TradeType.Exchange]: 'bg-blue-600',
      [TradeType.Sell]: 'bg-red-600'
    }
    return classMap[tradeType.value] || 'bg-gray-600'
  })

  // 交易类型显示文本映射
  const tradeTypeText = computed(() => {
    const textMap = {
      [TradeType.Gift]: '免費贈送',
      [TradeType.Exchange]: '交換',
      [TradeType.Sell]: '出售'
    }
    return textMap[tradeType.value] || '未知'
  })

  // 交易类型图标映射
  const tradeTypeIcon = computed(() => {
    const iconMap = {
      [TradeType.Gift]: 'gift',
      [TradeType.Exchange]: 'arrows-right-left',
      [TradeType.Sell]: 'currency-dollar'
    }
    return iconMap[tradeType.value] || 'question-mark-circle'
  })

  // 交易类型颜色映射（用于其他样式）
  const tradeTypeColor = computed(() => {
    const colorMap = {
      [TradeType.Gift]: 'green',
      [TradeType.Exchange]: 'blue',
      [TradeType.Sell]: 'red'
    }
    return colorMap[tradeType.value] || 'gray'
  })

  // 检查是否为特定交易类型
  const isForFree = computed(() => tradeType.value === TradeType.Gift)
  const isExchange = computed(() => tradeType.value === TradeType.Exchange)
  const isSell = computed(() => tradeType.value === TradeType.Sell)

  // 获取价格显示逻辑
  const shouldShowPrice = computed(() => tradeType.value === TradeType.Sell)

  return {
    tradeTypeClass,
    tradeTypeText,
    tradeTypeIcon,
    tradeTypeColor,
    isForFree,
    isExchange,
    isSell,
    shouldShowPrice
  }
}

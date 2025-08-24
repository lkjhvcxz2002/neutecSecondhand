<template>
  <component 
    :is="iconComponent" 
    :class="[
      'inline-block',
      sizeClasses[size],
      colorClasses[color] || 'text-current'
    ]"
    v-bind="$attrs"
  />
</template>

<script setup>
import { computed } from 'vue'
import {
  HomeIcon,
  UserIcon,
  Cog6ToothIcon as CogIcon,
  HeartIcon,
  StarIcon,
  MagnifyingGlassIcon as SearchIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  EnvelopeIcon as MailIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentIcon,
  FolderIcon,
  PhotoIcon as ImageIcon,
  VideoCameraIcon,
  GiftIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  FireIcon,
  BoltIcon,
  SunIcon,
  MoonIcon,
  CloudIcon,
  QuestionMarkCircleIcon,
  PencilIcon,
  UserPlusIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  TrashIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'

// 定义props
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'current'
  }
})

// 尺寸类映射
const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

// 颜色类映射
const colorClasses = {
  current: 'text-current',
  primary: 'text-primary-600',
  secondary: 'text-gray-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  white: 'text-white',
  black: 'text-black'
}

// 图标映射表
const iconMap = {
  'home': HomeIcon,
  'user': UserIcon,
  'cog': CogIcon,
  'heart': HeartIcon,
  'star': StarIcon,
  'search': SearchIcon,
  'plus': PlusIcon,
  'minus': MinusIcon,
  'check': CheckIcon,
  'x-mark': XMarkIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'eye': EyeIcon,
  'eye-slash': EyeSlashIcon,
  'lock-closed': LockClosedIcon,
  'lock-open': LockOpenIcon,
  'key': KeyIcon,
  'mail': MailIcon,
  'phone': PhoneIcon,
  'calendar': CalendarIcon,
  'clock': ClockIcon,
  'map-pin': MapPinIcon,
  'document': DocumentIcon,
  'folder': FolderIcon,
  'image': ImageIcon,
  'video-camera': VideoCameraIcon,
  'gift': GiftIcon,
  'shopping-cart': ShoppingCartIcon,
  'credit-card': CreditCardIcon,
  'banknotes': BanknotesIcon,
  'currency-dollar': CurrencyDollarIcon,
  'chart-bar': ChartBarIcon,
  'presentation-chart-line': PresentationChartLineIcon,
  'fire': FireIcon,
  'bolt': BoltIcon,
  'sun': SunIcon,
  'moon': MoonIcon,
  'cloud': CloudIcon,
  'question-mark-circle': QuestionMarkCircleIcon,
  'pencil': PencilIcon,
  'user-plus': UserPlusIcon,
  'user-circle': UserCircleIcon,
  'arrow-right-start-on-rectangle': ArrowRightStartOnRectangleIcon,
  'trash': TrashIcon,
  'arrow-path': ArrowPathIcon,
  'shopping-bag': ShoppingBagIcon,
  'information-circle': InformationCircleIcon,
  'exclamation-triangle': ExclamationTriangleIcon,
  'wrench-screwdriver': WrenchScrewdriverIcon
}

// 动态获取图标组件
const iconComponent = computed(() => {
  const iconName = props.name
  const icon = iconMap[iconName]
  
  if (icon) {
    return icon
  }
  
  // 如果找不到图标，返回默认图标
  console.warn(`Icon "${props.name}" not found, using default icon`)
  return QuestionMarkCircleIcon
})
</script>

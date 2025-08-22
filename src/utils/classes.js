// 常用class组合工具
export const classes = {
  // 布局相关
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-8',
    grid: {
      '2': 'grid md:grid-cols-2 gap-6',
      '3': 'grid md:grid-cols-2 lg:grid-cols-3 gap-6',
      '4': 'grid md:grid-cols-4 gap-4'
    }
  },
  
  // 表单相关
  form: {
    group: 'space-y-6',
    row: 'grid md:grid-cols-2 gap-4',
    label: 'block text-sm font-medium text-gray-700 mb-2',
    actions: 'flex justify-end space-x-3',
    field: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
  },
  
  // 卡片相关
  card: {
    header: 'flex items-center justify-between mb-4',
    content: 'space-y-4',
    footer: 'mt-4 pt-4 border-t border-gray-200'
  },
  
  // 标题相关
  title: {
    page: 'text-3xl font-bold text-gray-900 mb-4',
    section: 'text-lg font-medium text-gray-900 mb-2',
    card: 'text-xl font-semibold text-gray-900 mb-2'
  },
  
  // 按钮相关
  button: {
    group: 'flex space-x-3',
    primary: 'bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
  },
  
  // 筛选标签相关
  filterTag: {
    base: 'inline-flex items-center px-2 py-1 rounded-full text-xs',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    remove: 'ml-1 hover:opacity-75 transition-opacity'
  },
  
  // 状态相关
  status: {
    active: 'text-green-600',
    sold: 'text-red-600',
    inactive: 'text-gray-600'
  }
}

// 组合class的工具函数
export function combineClasses(...classNames) {
  return classNames.filter(Boolean).join(' ')
}

// 条件class的工具函数
export function conditionalClass(condition, trueClass, falseClass = '') {
  return condition ? trueClass : falseClass
}

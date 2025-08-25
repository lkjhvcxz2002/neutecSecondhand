/**
 * 根據環境返回正確的圖片 URL
 * @param {string} imagePath - 圖片路徑，例如：/uploads/products/image.jpg
 * @returns {string} 完整的圖片 URL
 */
export function getImageUrl(imagePath) {
  // 如果圖片路徑已經包含完整 URL，直接返回
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath
  }
  
  // 如果沒有圖片路徑，返回預設圖片
  if (!imagePath) {
    return '/placeholder-image.jpg'
  }
  
  // 在生產環境中，使用 Railway 後端的 URL
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_URL
    if (apiUrl) {
      // 移除路徑開頭的斜線，避免雙斜線
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
      return `${apiUrl}/${cleanPath}`
    }
  }
  
  // 在開發環境中，使用相對路徑（通過代理）
  return imagePath
}

/**
 * 獲取產品圖片 URL
 * @param {string} imagePath - 圖片路徑
 * @returns {string} 完整的圖片 URL
 */
export function getProductImageUrl(imagePath) {
  return getImageUrl(imagePath)
}

/**
 * 獲取用戶頭像 URL
 * @param {string} avatarPath - 頭像路徑
 * @returns {string} 完整的頭像 URL
 */
export function getAvatarUrl(avatarPath) {
  return getImageUrl(avatarPath)
}

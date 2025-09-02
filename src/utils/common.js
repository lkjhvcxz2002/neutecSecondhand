// 計算距離商品刪除還剩多少天
export const calculateDaysUntilExpiration = (createdAt) => {
    if (!createdAt) return 0
    const createdAtDate = new Date(createdAt)
    const expirationDate = new Date(createdAtDate.getTime() + 3 * 30 * 24 * 60 * 60 * 1000)
    const daysUntilExpiration = Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration
}
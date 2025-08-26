# 商品狀態映射說明

## 🔍 **問題背景**

原本的程式碼使用 `'inactive'` 狀態，但資料庫的 CHECK 約束不允許這個值，導致 SQLite 約束錯誤。

## 🔧 **修復方案**

將所有 `'inactive'` 狀態替換為資料庫允許的狀態值。

## 📊 **狀態值對照表**

| 原狀態值 | 新狀態值 | 說明 |
|---------|---------|------|
| `'inactive'` | `'removed'` | 商品已下架/移除 |
| `'inactive'` | `'expired'` | 商品已過期 |

## 🎯 **建議的狀態使用**

### **1. 商品下架**
- **使用狀態**：`'removed'`
- **語義**：商品被賣家或管理員主動下架
- **適用場景**：賣家暫時不想賣、管理員下架違規商品

### **2. 商品過期**
- **使用狀態**：`'expired'`
- **語義**：商品超過有效期限
- **適用場景**：商品發布時間過長、活動結束

### **3. 其他狀態**
- `'active'` - 商品正常上架中
- `'processing'` - 商品正在處理中（如審核、修改等）
- `'sold'` - 商品已售出

## 🔄 **API 端點更新**

### **更新商品狀態**
```http
PATCH /api/products/:id/status
```

**請求體**：
```json
{
  "status": "removed"  // 或 "expired"
}
```

**允許的狀態值**：
- `'active'`
- `'processing'`
- `'sold'`
- `'expired'`
- `'removed'`

### **查詢商品**
```http
GET /api/products?status=removed
```

**查詢參數**：
- `status`: `active`, `sold`, `expired`, `removed`

## 📝 **前端更新建議**

### **1. 狀態顯示文字**
```javascript
const statusTextMap = {
  'active': '上架中',
  'processing': '處理中',
  'sold': '已售出',
  'expired': '已過期',
  'removed': '已下架'
};
```

### **2. 狀態選擇器**
```javascript
const statusOptions = [
  { value: 'active', label: '上架中' },
  { value: 'processing', label: '處理中' },
  { value: 'sold', label: '已售出' },
  { value: 'expired', label: '已過期' },
  { value: 'removed', label: '已下架' }
];
```

### **3. 狀態過濾器**
```javascript
const statusFilterOptions = [
  { value: 'active', label: '上架中' },
  { value: 'sold', label: '已售出' },
  { value: 'expired', label: '已過期' },
  { value: 'removed', label: '已下架' }
];
```

## ✅ **修復完成**

所有使用 `'inactive'` 狀態的地方都已修復為資料庫允許的狀態值：

1. **`server/routes/products.js`** - 商品狀態更新和查詢
2. **`server/routes/admin.js`** - 管理員商品管理

## 🚀 **下一步**

1. **重新部署應用程式**
2. **測試商品狀態更新功能**
3. **更新前端狀態顯示和選擇器**
4. **享受穩定的商品狀態管理**

現在你可以正常使用 `'removed'` 或 `'expired'` 狀態來下架商品了！🎉

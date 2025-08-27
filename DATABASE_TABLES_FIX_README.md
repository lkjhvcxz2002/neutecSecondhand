# 資料庫表缺失問題修復指南

## 🔍 **問題描述**

用戶報告 `forgot-password` API 出現錯誤：
```
發送密碼重設郵件錯誤: [Error: SQLITE_ERROR: no such table: password_reset_tokens]
```

## 🎯 **問題分析**

### **根本原因**
1. **資料庫初始化不完整**：`password_reset_tokens` 表沒有在資料庫初始化腳本中創建
2. **表結構缺失**：密碼重設功能需要的表結構不存在
3. **API 錯誤處理不足**：沒有檢查表是否存在就直接執行查詢

### **受影響的功能**
- `/api/auth/forgot-password` - 發送密碼重設郵件
- `/api/auth/reset-password` - 重設密碼
- 其他依賴 `password_reset_tokens` 表的功能

## 🔧 **解決方案**

### **方案 1：運行修復腳本（推薦）**

1. **創建缺失的表**：
   ```bash
   cd server
   node scripts/create-missing-tables.js
   ```

2. **修復資料庫鎖定問題**：
   ```bash
   node scripts/fix-database-locks.js
   ```

3. **檢查資料庫表結構**：
   ```bash
   node scripts/check-database-tables.js
   ```

### **方案 2：手動創建表**

如果腳本無法運行，可以手動執行以下 SQL：

```sql
-- 創建密碼重設 token 表
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);

-- 創建郵件驗證 token 表
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_email_verification_email ON email_verification_tokens(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_expires ON email_verification_tokens(expires_at);
```

### **方案 3：重新初始化資料庫**

如果問題持續存在：

1. **備份現有資料**（如果重要）
2. **刪除現有資料庫檔案**
3. **重新啟動服務**，讓初始化腳本重新創建所有表

## 📋 **已實施的修復**

### **1. 改進資料庫初始化腳本**
- 在 `server/database/init.js` 中添加了 `password_reset_tokens` 表創建
- 添加了必要的索引創建

### **2. 改進 API 錯誤處理**
- 在 `forgot-password` 和 `reset-password` API 中添加了表存在性檢查
- 如果表不存在，會自動嘗試創建
- 添加了詳細的日誌記錄

### **3. 創建修復腳本**
- `create-missing-tables.js` - 創建缺失的表
- `fix-database-locks.js` - 修復資料庫鎖定問題
- `check-database-tables.js` - 檢查資料庫表結構

## 🧪 **測試步驟**

### **1. 測試密碼重設功能**
```bash
# 測試發送密碼重設郵件
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### **2. 檢查資料庫表**
```bash
cd server
node scripts/check-database-tables.js
```

### **3. 檢查伺服器日誌**
查看伺服器控制台輸出，確認：
- 表創建成功
- API 正常執行
- 沒有錯誤訊息

## 🚨 **注意事項**

### **安全性考慮**
- 密碼重設 token 有 1 小時的過期時間
- 使用過的 token 會被標記為已使用
- 即使郵件發送失敗，token 也會被儲存（避免安全問題）

### **資料庫維護**
- 定期清理過期的 token 記錄
- 監控資料庫性能
- 備份重要資料

## 📞 **如果問題持續**

如果執行以上步驟後問題仍然存在：

1. **檢查 Railway 環境**：確認 Volume 權限和路徑
2. **檢查伺服器日誌**：查看詳細的錯誤訊息
3. **重新部署服務**：在 Railway 中重新部署
4. **聯繫支援**：提供錯誤日誌和環境資訊

## 🎉 **預期結果**

修復完成後：
- `forgot-password` API 正常工作
- `reset-password` API 正常工作
- 資料庫表結構完整
- 沒有 "no such table" 錯誤
- 密碼重設功能完全可用

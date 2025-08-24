# 郵件服務配置說明

## 概述

本系統支援多種郵件服務，包括：
- **Proton Mail** (推薦) - 免費、安全、設定簡單
- **Outlook/Hotmail** - 微軟服務，穩定性高
- **Yahoo Mail** - 免費且設定簡單
- **Gmail** - 需要應用程式密碼
- **自定義 SMTP** - 完全控制

## 🚀 快速開始 - Proton Mail (推薦)

### 1. 註冊 Proton Mail 帳號
- 前往 [proton.me](https://proton.me)
- 註冊免費帳號
- 記下郵箱地址和密碼

### 2. 環境變數配置
在 `server` 目錄下創建 `.env` 檔案：

```env
# 郵件服務類型
EMAIL_SERVICE=proton

# 郵件帳號資訊
EMAIL_USER=your-email@proton.me
EMAIL_PASS=your-proton-password

# 前端網址
FRONTEND_URL=http://localhost:3000

# JWT 密鑰
JWT_SECRET=your-super-secret-jwt-key

# 伺服器配置
PORT=5000
NODE_ENV=development
```

### 3. 啟動測試
```bash
cd server
npm start
```

## 📧 其他郵件服務配置

### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Mail
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-password
```

### Gmail (需要應用程式密碼)
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 自定義 SMTP 伺服器
```env
EMAIL_SERVICE=custom
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
SMTP_HOST=smtp.your-domain.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Ethereal Email (測試用)
```env
EMAIL_SERVICE=ethereal
EMAIL_USER=test@ethereal.email
EMAIL_PASS=test123
```

## 🔧 安裝依賴

```bash
cd server
npm install nodemailer
```

## 📊 郵件功能詳解

### 1. 歡迎郵件
- **觸發時機**：用戶註冊成功後
- **內容**：歡迎訊息、平台特色介紹、開始使用按鈕
- **樣式**：響應式 HTML 郵件，支援各種郵件客戶端

### 2. 重設密碼郵件
- **觸發時機**：用戶請求重設密碼
- **內容**：重設密碼連結、安全提醒、管理員聯繫方式
- **安全性**：令牌 1 小時後過期，使用後立即失效

### 3. 帳戶狀態變更通知
- **觸發時機**：管理員變更用戶狀態
- **內容**：狀態變更通知、變更原因、聯繫方式

## 🆚 各服務比較

| 服務 | 優點 | 缺點 | 推薦度 |
|------|------|------|--------|
| **Proton Mail** | 免費、安全、設定簡單 | 免費版限制 | ⭐⭐⭐⭐⭐ |
| **Outlook** | 穩定、微軟支援 | 需要應用程式密碼 | ⭐⭐⭐⭐ |
| **Yahoo** | 免費、設定簡單 | 可能被標記垃圾郵件 | ⭐⭐⭐ |
| **Gmail** | 功能強大 | 設定複雜、需要兩步驟驗證 | ⭐⭐ |
| **自定義 SMTP** | 完全控制 | 需要技術知識 | ⭐⭐⭐⭐ |

## 🧪 測試方法

### 1. 本地測試
```bash
# 啟動伺服器
cd server
npm start

# 測試郵件發送
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. 郵件配置驗證
系統會自動驗證郵件配置並提供詳細的錯誤建議。

## 🚨 故障排除

### 常見問題

1. **認證失敗**
   - 確認郵箱和密碼是否正確
   - 檢查服務類型設定
   - 確認帳戶未被鎖定

2. **連接失敗**
   - 檢查網路連接
   - 確認 SMTP 伺服器地址和端口
   - 檢查防火牆設定

3. **郵件被標記為垃圾郵件**
   - 設定 SPF、DKIM 記錄
   - 避免過於頻繁的發送
   - 使用企業郵件服務

### 錯誤代碼對應

- `Invalid login`: 檢查郵箱和密碼
- `ECONNREFUSED`: 檢查 SMTP 伺服器地址和端口
- `ENOTFOUND`: 檢查網路連接和 DNS 設定

## 🔒 安全性建議

1. **環境變數管理**
   - 使用 `.env` 檔案管理敏感資訊
   - 將 `.env` 加入 `.gitignore`
   - 定期更換密碼

2. **郵件發送限制**
   - 實施發送頻率限制
   - 監控異常發送行為
   - 記錄所有郵件發送活動

## 📈 生產環境建議

### 1. 郵件服務選擇
- **小型專案**: Proton Mail 或 Outlook
- **中大型專案**: 自定義 SMTP 或企業郵件服務
- **企業級應用**: 專用郵件伺服器

### 2. 監控和維護
- 郵件發送成功率監控
- 郵件退信處理
- 用戶反饋收集
- 郵件範本 A/B 測試

## 🚀 擴展功能

### 未來可添加的功能
1. **郵件範本管理系統**
2. **多語言郵件支援**
3. **郵件發送排程**
4. **郵件追蹤和分析**
5. **自定義郵件簽名**
6. **郵件群發功能**

## 📞 聯繫支援

如有任何問題，請聯繫：
- **Telegram**: @ParkerDuTW
- **Email**: 系統管理員
- **文檔**: 查看本 README 檔案

## 💡 快速測試建議

1. **首次使用**: 建議使用 Proton Mail 或 Ethereal Email 進行測試
2. **功能驗證**: 先測試歡迎郵件，再測試重設密碼功能
3. **錯誤處理**: 系統會自動提供詳細的錯誤建議和解決方案

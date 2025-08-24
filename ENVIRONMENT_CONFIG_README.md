# 🌍 環境配置說明

## 概述

本系統支援多環境配置，可以輕鬆切換開發、測試、生產等不同環境的設定。

## 📁 檔案結構

```
server/
├── .env.development     # 開發環境配置
├── .env.production      # 生產環境配置
├── .env.test           # 測試環境配置
├── .env.common         # 通用配置
├── .env.local          # 本地配置（可選）
├── config/
│   └── env.js          # 環境配置載入器
└── server.js           # 主伺服器檔案
```

## 🚀 快速開始

### 1. 創建環境配置檔案

#### 開發環境 (.env.development)
```bash
# 複製範例檔案
cp env.development.example .env.development

# 編輯配置
nano .env.development
```

#### 生產環境 (.env.production)
```bash
# 複製範例檔案
cp env.production.example .env.production

# 編輯配置
nano .env.production
```

### 2. 啟動不同環境

```bash
# 開發環境
npm run dev

# 生產環境
npm run prod

# 測試環境
npm run test

# 開發環境（監控模式）
npm run dev:watch
```

## ⚙️ 配置優先級

配置載入順序（後面的會覆蓋前面的）：

1. **通用配置** (`.env.common`)
2. **環境特定配置** (`.env.development`, `.env.production`)
3. **本地配置** (`.env.local`) - 可選，用於個人設定
4. **系統環境變數**

## 🔧 配置項目說明

### 基本配置
```env
# 環境標識
NODE_ENV=development

# 應用資訊
APP_NAME=二手交換平台
APP_VERSION=1.0.0
```

### 伺服器配置
```env
# 伺服器設定
PORT=5000
HOST=localhost

# 開發環境使用 localhost
# 生產環境使用 0.0.0.0
```

### 郵件服務配置
```env
# 郵件服務類型
EMAIL_SERVICE=gmail

# 郵件帳號
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-password

# 支援的服務：gmail, outlook, yahoo, proton, custom
```

### 安全配置
```env
# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 安全中間件
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### 資料庫配置
```env
# 資料庫路徑
DB_PATH=./database/secondhand.db

# 檔案上傳
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 🌍 環境切換

### 方法 1：使用啟動腳本
```bash
# 開發環境
npm run dev

# 生產環境
npm run prod
```

### 方法 2：設定環境變數
```bash
# Windows
set NODE_ENV=production
npm start

# Linux/Mac
export NODE_ENV=production
npm start
```

### 方法 3：直接指定
```bash
NODE_ENV=production node server.js
```

## 🔒 安全性建議

### 1. 密鑰管理
- **開發環境**: 使用簡單的測試密鑰
- **生產環境**: 使用強密鑰，定期更換
- **測試環境**: 使用獨立的測試密鑰

### 2. 檔案權限
```bash
# 設定適當的檔案權限
chmod 600 .env.production
chmod 600 .env.common
```

### 3. 環境變數檢查
系統會自動檢查必要配置：
- `EMAIL_SERVICE`
- `EMAIL_USER`
- `EMAIL_PASS`
- `JWT_SECRET`

## 📊 配置驗證

啟動時會顯示配置摘要：
```
📋 配置摘要:
================
環境: development
伺服器: localhost:5000
郵件服務: gmail
郵件帳號: your-email@gmail.com
資料庫: ./database/secondhand.db
維護模式: false
================
```

## 🚨 故障排除

### 1. 配置檔案不存在
```
⚠️  development 環境配置檔案不存在: .env.development
```
**解決方案**: 複製範例檔案並編輯

### 2. 缺少必要配置
```
❌ 缺少必要配置: EMAIL_SERVICE, EMAIL_USER
```
**解決方案**: 檢查環境變數檔案是否包含所有必要配置

### 3. 配置載入失敗
**檢查項目**:
- 檔案路徑是否正確
- 檔案格式是否正確
- 檔案權限是否適當

## 📝 最佳實踐

### 1. 配置檔案管理
- 將 `.env.*` 加入 `.gitignore`
- 保留 `.env.*.example` 作為範例
- 使用 `.env.local` 進行個人設定

### 2. 環境隔離
- 開發環境使用本地資源
- 生產環境使用外部服務
- 測試環境使用模擬服務

### 3. 配置備份
- 定期備份生產環境配置
- 使用配置管理工具
- 記錄配置變更歷史

## 🔄 配置更新

### 1. 熱重載配置
```bash
# 開發環境（監控模式）
npm run dev:watch
```

### 2. 重啟服務
```bash
# 停止服務
Ctrl + C

# 重新啟動
npm run dev
```

## 📚 相關文檔

- [郵件服務配置](./EMAIL_CONFIG_README.md)
- [資料庫配置](./DATABASE_README.md)
- [部署指南](./DEPLOYMENT_README.md)

## 💡 小貼士

1. **開發時**: 使用 `npm run dev:watch` 自動重載
2. **測試時**: 使用 `npm run test` 獨立測試環境
3. **部署時**: 使用 `npm run prod` 生產環境
4. **調試時**: 檢查啟動日誌中的配置摘要

## 📞 支援

如有配置問題，請聯繫：
- **Telegram**: @ParkerDuTW
- **文檔**: 查看相關 README 檔案
- **日誌**: 檢查伺服器啟動日誌

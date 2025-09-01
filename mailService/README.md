# Mail Service 微服務

獨立的郵件發送微服務，使用 Gmail SMTP 發送郵件。

## 功能特色

- 🚀 獨立微服務架構
- 📧 支援單封和批量郵件發送
- 🔐 多種郵件服務支援（Gmail、Outlook、Yahoo、Proton、自定義 SMTP）
- 🌐 RESTful API 設計
- 🔒 安全性和 CORS 支援
- 📊 健康檢查和狀態監控

## 部署到 Google Cloud Run

### 1. 前置需求

- Google Cloud 專案
- 已安裝 gcloud CLI
- Gmail OAuth2 憑證

### 2. 設定郵件服務

#### Gmail 設定（推薦）
1. 前往 [Google Account Settings](https://myaccount.google.com/)
2. 啟用「兩步驟驗證」
3. 建立「應用程式密碼」
4. 使用應用程式密碼作為 `EMAIL_PASS`

#### 其他郵件服務
- **Outlook**: 使用 Microsoft 帳號和密碼
- **Yahoo**: 使用 Yahoo 帳號和密碼
- **Proton**: 使用 Proton Mail Bridge
- **自定義 SMTP**: 填入伺服器資訊

### 3. 設定環境變數

複製 `env.example` 為 `.env` 並填入實際值：

```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. 部署

```bash
# 修改 deploy.sh 中的 PROJECT_ID
chmod +x deploy.sh
./deploy.sh
```

## API 端點

### 健康檢查
```
GET /health
```

### 服務狀態
```
GET /status
```

### 發送單封郵件
```
POST /send
Content-Type: application/json

{
  "receivers": ["user@example.com"],
  "subject": "測試郵件",
  "content": "這是測試內容",
  "contentType": "text" // 或 "html"
}
```

### 批量發送郵件
```
POST /send-batch
Content-Type: application/json

{
  "emails": [
    {
      "receivers": ["user1@example.com"],
      "subject": "郵件 1",
      "content": "內容 1"
    },
    {
      "receivers": ["user2@example.com"],
      "subject": "郵件 2",
      "content": "內容 2"
    }
  ]
}
```

## 本地開發

```bash
npm install
npm run dev
```

## 生產環境

```bash
npm start
```

## 環境變數

| 變數 | 說明 | 必填 |
|------|------|------|
| `EMAIL_SERVICE` | 郵件服務類型（gmail、outlook、yahoo、proton、custom） | ✅ |
| `EMAIL_USER` | 郵箱帳號 | ✅ |
| `EMAIL_PASS` | 郵箱密碼或應用程式密碼 | ✅ |
| `NODE_ENV` | 環境模式 | ❌ |
| `PORT` | 服務端口 | ❌ |
| `ALLOWED_ORIGINS` | 允許的 CORS 來源 | ❌ |

# Mail Service 部署指南

## 快速部署到 Google Cloud Run

### 1. 前置需求

- Google Cloud 專案
- 已安裝 gcloud CLI
- 郵箱帳號和密碼

### 2. Gmail 設定（推薦）

#### 啟用兩步驟驗證
1. 前往 [Google Account Settings](https://myaccount.google.com/)
2. 點擊「安全性」
3. 啟用「兩步驟驗證」

#### 建立應用程式密碼
1. 在「安全性」頁面找到「應用程式密碼」
2. 選擇「郵件」和「其他（自訂名稱）」
3. 輸入名稱（例如：二手交換平台）
4. 複製生成的 16 位元密碼

### 3. 部署步驟

#### 步驟 1：設定環境變數
```bash
cd mailService
cp env.example .env
```

編輯 `.env` 檔案：
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password
NODE_ENV=production
PORT=3000
```

#### 步驟 2：修改部署腳本
編輯 `deploy.sh`：
```bash
PROJECT_ID="your-google-cloud-project-id"  # 改為你的專案 ID
SERVICE_NAME="mail-service"
REGION="asia-east1"
```

#### 步驟 3：部署
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. 驗證部署

部署完成後，測試以下端點：

```bash
# 健康檢查
curl https://your-service-url.a.run.app/health

# 服務狀態
curl https://your-service-url.a.run.app/status

# 測試發送郵件
curl -X POST https://your-service-url.a.run.app/send \
  -H "Content-Type: application/json" \
  -d '{
    "receivers": ["test@example.com"],
    "subject": "測試郵件",
    "content": "這是一封測試郵件"
  }'
```

### 5. 故障排除

#### 常見問題

**Q: 郵件發送失敗，顯示認證錯誤**
A: 檢查 `EMAIL_USER` 和 `EMAIL_PASS` 是否正確，Gmail 需要使用應用程式密碼

**Q: 服務無法啟動**
A: 檢查環境變數是否正確設定，特別是 `EMAIL_USER` 和 `EMAIL_PASS`

**Q: 郵件發送超時**
A: 檢查網路連接和防火牆設定

#### 日誌查看
```bash
gcloud logs read --service=mail-service --limit=50
```

### 6. 其他郵件服務設定

#### Outlook
```bash
EMAIL_SERVICE=outlook
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

#### Yahoo
```bash
EMAIL_SERVICE=yahoo
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
```

#### 自定義 SMTP
```bash
EMAIL_SERVICE=custom
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_password
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 更新 Railway 服務

部署完成後，在 Railway 中設定：

```
MAIL_SERVICE_URL=https://your-mail-service-url.a.run.app
```

然後重新部署 Railway 服務即可！

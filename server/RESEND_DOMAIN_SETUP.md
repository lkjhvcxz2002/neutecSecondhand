# Resend 域名設定指南

## 🚨 **重要說明**

Resend **不支援使用 Gmail 地址**作為發件人！必須使用自己的域名或 Resend 提供的測試域名。

## 🧪 **測試階段（臨時方案）**

### 使用 Resend 測試域名

```bash
# 環境變數設定
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**特點：**
- ✅ 免費使用
- ✅ 無需域名驗證
- ✅ 適合測試
- ❌ 僅供開發測試
- ❌ 可能被垃圾郵件過濾器攔截

## 🌐 **生產環境（推薦方案）**

### 1. 購買域名

推薦域名註冊商：
- [Namecheap](https://www.namecheap.com/)
- [GoDaddy](https://www.godaddy.com/)
- [Cloudflare](https://www.cloudflare.com/products/registrar/)

**建議域名：**
- `neutecsecondhand.com`
- `neutec-secondhand.com`
- `secondhand-neutec.com`

### 2. 在 Resend 中添加域名

1. **登入 Resend 控制台**
   - 前往 [resend.com/dashboard](https://resend.com/dashboard)

2. **添加域名**
   - 點擊左側 **"Domains"**
   - 點擊 **"Add Domain"**
   - 輸入域名：`neutecsecondhand.com`
   - 點擊 **"Add"**

### 3. 設定 DNS 記錄

Resend 會提供類似以下的 DNS 記錄：

```dns
# 域名驗證記錄
Type: TXT
Name: _resend
Value: resend-domain-verification=re_xxxxxxxxxxxxxxxxxxxx
TTL: 3600

# SPF 記錄
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600

# DKIM 記錄
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
TTL: 3600

# DMARC 記錄（可選但推薦）
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@neutecsecondhand.com
TTL: 3600
```

### 4. 在域名註冊商添加記錄

以 **Cloudflare** 為例：

1. 登入 Cloudflare 控制台
2. 選擇你的域名
3. 點擊 **"DNS"** 標籤
4. 點擊 **"Add record"**
5. 逐一添加上述 DNS 記錄

### 5. 驗證域名

1. 添加 DNS 記錄後等待 5-30 分鐘
2. 在 Resend 控制台點擊 **"Verify"**
3. 等待驗證完成（通常幾分鐘內）

### 6. 更新環境變數

```bash
# 驗證成功後更新環境變數
RESEND_FROM_EMAIL=noreply@neutecsecondhand.com
# 或
RESEND_FROM_EMAIL=admin@neutecsecondhand.com
```

## 📧 **發件人地址建議**

### 常用的發件人地址：
```
noreply@neutecsecondhand.com      # 系統通知
admin@neutecsecondhand.com        # 管理員郵件
support@neutecsecondhand.com      # 客服郵件
welcome@neutecsecondhand.com      # 歡迎郵件
reset@neutecsecondhand.com        # 密碼重設
```

## 🔍 **驗證狀態檢查**

### 檢查 DNS 傳播：
```bash
# 檢查 TXT 記錄
nslookup -type=TXT _resend.neutecsecondhand.com

# 檢查 SPF 記錄
nslookup -type=TXT neutecsecondhand.com

# 檢查 DKIM 記錄
nslookup -type=CNAME resend._domainkey.neutecsecondhand.com
```

### 線上工具：
- [DNS Checker](https://dnschecker.org/)
- [MX Toolbox](https://mxtoolbox.com/)

## 🚀 **部署到 Railway**

### 環境變數設定：
```bash
# 在 Railway 中設定
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@neutecsecondhand.com
```

### 測試郵件功能：
```bash
# 訪問測試頁面
https://your-railway-app.up.railway.app/email-test.html
```

## 🐛 **常見問題**

### Q1: 驗證失敗怎麼辦？
**A:** 
- 檢查 DNS 記錄是否正確添加
- 等待 DNS 傳播完成（最多 48 小時）
- 確認記錄值完全匹配（包括標點符號）

### Q2: 郵件被標記為垃圾郵件？
**A:**
- 確保 SPF、DKIM、DMARC 記錄正確
- 使用專業的發件人地址
- 避免使用垃圾郵件關鍵詞

### Q3: 可以使用子域名嗎？
**A:** 
可以！例如：
- `mail.neutecsecondhand.com`
- `email.neutecsecondhand.com`

## 📋 **檢查清單**

- [ ] 購買域名
- [ ] 在 Resend 中添加域名
- [ ] 設定所有 DNS 記錄
- [ ] 等待 DNS 傳播
- [ ] 在 Resend 中驗證域名
- [ ] 更新環境變數
- [ ] 測試郵件發送
- [ ] 檢查垃圾郵件箱

## 🎯 **建議流程**

1. **立即開始**：使用 `onboarding@resend.dev` 進行測試
2. **購買域名**：選擇合適的域名
3. **設定 DNS**：按照指南添加記錄
4. **驗證域名**：確保驗證成功
5. **生產部署**：使用自己的域名發送郵件

這樣你就能成功設定 Resend 郵件服務了！

# 二手交換平台 (Second-Hand Exchange Platform)

一個基於 Vue.js 和 Node.js 的二手商品交換平台，支持商品上架、交換、贈送和買賣功能。

## 🚀 功能特色

- **多種交易方式**: 支持出售、交換、免費贈送
- **商品管理**: 完整的商品 CRUD 操作
- **用戶認證**: 安全的用戶註冊和登入系統
- **圖片上傳**: 支持多圖片上傳和預覽
- **響應式設計**: 適配桌面和移動設備
- **即時搜索**: 商品搜索和篩選功能

## 🛠️ 技術棧

### 前端
- **Vue 3** - 現代化的前端框架
- **Vite** - 快速的構建工具
- **Tailwind CSS** - 實用優先的 CSS 框架
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue 狀態管理庫

### 後端
- **Node.js** - JavaScript 運行時
- **Express.js** - Web 應用框架
- **SQLite** - 輕量級數據庫
- **Multer** - 文件上傳中間件
- **bcryptjs** - 密碼加密

## 📦 安裝和運行

### 前置需求
- Node.js 16+ 
- npm 或 yarn

### 安裝依賴
```bash
# 安裝前端依賴
npm install

# 安裝後端依賴
cd server
npm install
```

### 運行開發服務器
```bash
# 啟動前端開發服務器 (端口 3000)
npm run dev

# 啟動後端 API 服務器 (端口 5000)
cd server
npm run dev
```

### 構建生產版本
```bash
# 構建前端
npm run build

# 啟動生產服務器
npm run preview
```

## 🗄️ 數據庫

### 初始化數據庫
```bash
cd server/database
node init.js
```

### 數據庫遷移
```bash
cd server/database
node migrate.js
```

## 📁 項目結構

```
second-hand/
├── src/                    # 前端源代碼
│   ├── components/        # Vue 組件
│   ├── views/            # 頁面組件
│   ├── stores/           # Pinia 狀態管理
│   ├── composables/      # 可重用邏輯
│   └── style.css         # 全局樣式
├── server/                # 後端源代碼
│   ├── routes/           # API 路由
│   ├── database/         # 數據庫相關
│   ├── middleware/       # 中間件
│   └── uploads/          # 上傳文件存儲
├── public/                # 靜態資源
└── package.json           # 項目配置
```

## 🔧 開發指南

### 代碼風格
- 使用 ESLint 和 Prettier 保持代碼一致性
- 遵循 Vue 3 Composition API 最佳實踐
- 組件命名使用 PascalCase
- 文件命名使用 kebab-case

### 提交規範
```bash
# 功能開發
git commit -m "feat: 添加商品搜索功能"

# 錯誤修復
git commit -m "fix: 修復圖片上傳問題"

# 文檔更新
git commit -m "docs: 更新 README 文檔"

# 代碼重構
git commit -m "refactor: 重構用戶認證邏輯"
```

### 分支策略
- `main` - 主分支，用於生產環境
- `develop` - 開發分支，用於功能整合
- `feature/*` - 功能分支，用於新功能開發
- `hotfix/*` - 熱修復分支，用於緊急修復

## 🚀 部署

### 環境變量
創建 `.env` 文件：
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

### 生產構建
```bash
# 前端構建
npm run build

# 後端啟動
cd server
npm start
```

## 📝 更新日誌

### v1.0.0 (2024-01-XX)
- 🎉 初始版本發布
- ✨ 基礎商品管理功能
- 🔐 用戶認證系統
- 📱 響應式設計
- 🖼️ 圖片上傳功能

## 🤝 貢獻指南

1. Fork 本項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 許可證

本項目採用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情

## 📞 聯繫方式

如有問題或建議，請開啟 Issue 或聯繫開發團隊。

---

**開發團隊** - 二手交換平台項目組

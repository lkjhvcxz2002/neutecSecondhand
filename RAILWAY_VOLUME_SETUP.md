# Railway Volume + SQLite 設置指南

本指南將幫助你在 Railway 上設置使用 Volume 持久化存儲的 SQLite 資料庫和檔案系統。

## 🚀 快速開始

### 1. 創建 Railway 服務

1. **創建新的 Railway 項目**
2. **添加 Volume 服務**：
   - 在項目中點擊 "New Service"
   - 選擇 "Volume"
   - 命名為 `data-volume`
   - 掛載路徑設為 `/data`

3. **部署你的應用**：
   - 連接你的 GitHub 倉庫
   - Railway 會自動部署你的 Node.js 應用

### 2. 設置環境變數

在 Railway 項目設置中添加以下環境變數：

```bash
RAILWAY_ENVIRONMENT=production
RAILWAY_VOLUME_MOUNT_PATH=/data
NODE_ENV=production
```

### 3. 初始化資料庫

部署完成後，在 Railway Shell 中執行：

```bash
# 初始化 SQLite 資料庫
node scripts/init-railway-db.js

# 檢查健康狀態
curl https://your-app.railway.app/api/health
```

## 📁 檔案結構

部署後，Volume 中的檔案結構如下：

```
/data/
├── database.db          # SQLite 資料庫檔案
└── uploads/
    ├── avatars/         # 用戶頭像
    └── products/        # 商品圖片
```

## 🔧 配置說明

### 環境變數

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `RAILWAY_ENVIRONMENT` | Railway 環境標識 | - |
| `RAILWAY_VOLUME_MOUNT_PATH` | Volume 掛載路徑 | `/data` |
| `MAX_FILE_SIZE` | 最大檔案上傳大小 | `5242880` (5MB) |

### 路徑配置

- **資料庫路徑**: `/data/database.db`
- **上傳路徑**: `/data/uploads`
- **頭像路徑**: `/data/uploads/avatars`
- **商品圖片路徑**: `/data/uploads/products`

## 📊 資料庫表結構

初始化後會創建以下表：

### users 表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  telegram TEXT,
  status TEXT DEFAULT 'active',
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### products 表
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price REAL,
  category TEXT NOT NULL,
  trade_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  images TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### system_settings 表
```sql
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  is_public INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### maintenance 表
```sql
CREATE TABLE maintenance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enabled INTEGER DEFAULT 0,
  message TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔍 監控和維護

### 健康檢查

訪問 `/api/health` 端點查看系統狀態：

```bash
curl https://your-app.railway.app/api/health
```

回應範例：
```json
{
  "status": "OK",
  "message": "二手交換平台API運行中",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "storage": {
    "type": "Railway Volume",
    "databasePath": "/data/database.db",
    "uploadPath": "/data/uploads",
    "isRailway": true
  }
}
```

### 備份和恢復

1. **備份資料庫**：
   ```bash
   # 在 Railway Shell 中
   cp /data/database.db /tmp/backup.db
   ```

2. **備份上傳檔案**：
   ```bash
   # 在 Railway Shell 中
   tar -czf /tmp/uploads-backup.tar.gz /data/uploads/
   ```

## 🚨 故障排除

### 常見問題

1. **Volume 掛載失敗**
   - 檢查 Volume 服務是否正在運行
   - 確認掛載路徑設置正確

2. **資料庫初始化失敗**
   - 檢查目錄權限
   - 確認 Volume 有足夠空間

3. **檔案上傳失敗**
   - 檢查上傳目錄是否存在
   - 確認檔案大小限制

### 日誌查看

在 Railway Dashboard 中查看應用日誌：

```bash
# 查看最近的部署日誌
railway logs
```

## 💰 成本說明

- **Volume 存儲**: Railway 按實際使用量計費
- **資料庫檔案**: 通常很小，成本很低
- **上傳檔案**: 根據圖片數量和大小而定

## 📞 支援

如果遇到問題：

1. 檢查 Railway Dashboard 中的日誌
2. 確認環境變數設置
3. 驗證 Volume 服務狀態

## 🎉 完成

設置完成後，你的應用將：

- ✅ 使用 Railway Volume 持久化存儲
- ✅ SQLite 資料庫在 Volume 中運行
- ✅ 上傳檔案持久保存
- ✅ 支援重新部署而不丟失數據
- ✅ 自動目錄創建和管理

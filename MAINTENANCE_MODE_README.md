# 維護模式功能說明

## 功能概述

維護模式是一個系統級功能，當啟用時，所有用戶（包括未登入用戶）都會被重定向到維護頁面，無法進行任何操作。

## 架構設計

### 後端 API

1. **公開 API** (`/api/maintenance/status`)
   - 路徑：`GET /api/maintenance/status`
   - 權限：無需認證
   - 用途：檢查系統維護狀態
   - 響應：
     ```json
     {
       "success": true,
       "maintenanceMode": false,
       "message": "維護模式狀態已獲取"
     }
     ```

2. **管理員 API** (`/api/admin/maintenance`)
   - 路徑：`POST /api/admin/maintenance/toggle`
   - 權限：需要管理員登入
   - 用途：切換維護模式狀態
   - 響應：
     ```json
     {
       "message": "維護模式已啟用",
       "maintenanceMode": true
     }
     ```

### 前端實現

1. **維護頁面** (`/maintenance-page`)
   - 路徑：`src/views/MaintenancePage.vue`
   - 功能：
     - 顯示維護狀態
     - 自動檢查維護狀態（每30秒）
     - 倒數計時（30秒後自動檢查）
     - 當維護模式關閉時自動重定向到首頁

2. **404 錯誤頁面** (`/:pathMatch(.*)*`)
   - 路徑：`src/views/NotFound.vue`
   - 功能：
     - 捕獲所有不存在的路徑
     - 顯示友好的錯誤訊息
     - 提供「返回上一頁」和「回到首頁」按鈕
     - 包含聯繫管理員的資訊

3. **路由守衛**
   - 位置：`src/router/index.js`
   - 功能：每次路由切換時檢查維護狀態
   - 邏輯：如果維護模式啟用，重定向到維護頁面
   - 特殊處理：維護頁面和404頁面不受維護模式限制

4. **狀態管理**
   - Store：`src/stores/maintenance.js`
   - 功能：管理維護模式狀態和相關操作

## 路由優先級

Vue Router 的路由匹配順序：

1. **具體路由**：如 `/products`, `/admin`, `/login` 等
2. **參數路由**：如 `/products/:id`, `/edit-product/:id` 等
3. **通配符路由**：`/:pathMatch(.*)*` - 捕獲所有不匹配的路徑

**重要**：404 路由必須放在所有其他路由的最後，否則會攔截正常的路由請求。

## 使用方法

### 啟用維護模式

1. 以管理員身份登入系統
2. 進入管理員控制台 (`/admin`)
3. 點擊「系統維護」按鈕
4. 點擊「啟用維護模式」按鈕

### 關閉維護模式

1. 以管理員身份登入系統
2. 進入管理員控制台 (`/admin`)
3. 點擊「系統維護」按鈕
4. 點擊「關閉維護模式」按鈕

### 測試 404 功能

1. 在瀏覽器地址欄輸入不存在的路徑（如 `/not-exist`）
2. 應該會顯示 404 錯誤頁面
3. 測試「返回上一頁」和「回到首頁」按鈕功能

## 技術特點

1. **全局攔截**：所有路由都會檢查維護狀態
2. **自動檢查**：維護頁面會定期檢查狀態
3. **無縫切換**：維護模式關閉後自動恢復正常訪問
4. **權限分離**：狀態檢查公開，控制操作需要管理員權限
5. **日誌記錄**：所有維護模式操作都會記錄到 `admin_logs` 表
6. **404 處理**：捕獲所有不存在的路徑，提供友好的錯誤頁面
7. **路由優先級**：確保 404 路由不會攔截正常的路由請求

## 資料庫結構

### system_settings 表
```sql
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### admin_logs 表
```sql
CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users (id)
);
```

## 安全考慮

1. **狀態檢查公開**：允許未認證用戶檢查維護狀態
2. **控制操作受保護**：只有管理員可以切換維護模式
3. **操作日誌**：記錄所有維護模式操作，便於審計
4. **IP 記錄**：記錄操作者的 IP 地址
5. **404 安全**：404 頁面不暴露系統內部資訊

## 故障排除

### 常見問題

1. **維護頁面無法顯示**
   - 檢查 `MaintenancePage.vue` 組件是否正確導入
   - 確認路由配置是否正確

2. **維護狀態檢查失敗**
   - 檢查後端服務是否運行
   - 確認資料庫連接是否正常
   - 檢查 `system_settings` 表是否存在

3. **維護模式無法切換**
   - 確認用戶是否具有管理員權限
   - 檢查認證 token 是否有效
   - 查看後端日誌是否有錯誤

4. **404 頁面不顯示**
   - 確認 `NotFound.vue` 組件是否正確導入
   - 檢查通配符路由是否放在最後
   - 確認路由守衛沒有攔截 404 路由

5. **正常路由被 404 攔截**
   - 檢查路由定義順序
   - 確認通配符路由在最後
   - 檢查路由參數是否正確

### 調試方法

1. **檢查瀏覽器控制台**：查看前端錯誤日誌
2. **檢查後端日誌**：查看伺服器錯誤日誌
3. **檢查資料庫**：直接查詢 `system_settings` 表
4. **使用測試腳本**：運行維護模式 API 測試
5. **路由調試**：使用 Vue DevTools 檢查路由狀態
6. **404 測試**：使用 `test_404.html` 進行測試

## 擴展功能

未來可以考慮添加的功能：

1. **維護時間設定**：設定維護開始和結束時間
2. **維護原因顯示**：在維護頁面顯示維護原因
3. **維護進度更新**：實時更新維護進度
4. **通知功能**：維護開始前通知在線用戶
5. **維護歷史記錄**：查看過往的維護記錄
6. **自定義 404 頁面**：根據不同路徑顯示不同的錯誤訊息
7. **404 統計**：記錄和分析 404 錯誤的頻率
8. **智能重定向**：根據用戶意圖提供相關頁面建議

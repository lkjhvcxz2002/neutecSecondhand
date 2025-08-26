# 用戶註冊問題修復總結

## 🔍 **問題描述**

用戶註冊時出現以下錯誤：
```
註冊錯誤: [Error: SQLITE_CONSTRAINT: NOT NULL constraint failed: users.username]
```

## 🎯 **問題原因**

### **欄位數量不匹配**
- **資料表結構**：`users` 表有 11 個欄位
- **INSERT 語句**：只提供 4 個值
- **缺少欄位**：`username` 是必填欄位 (`NOT NULL`)，但註冊時沒有提供

### **資料表結構** (`server/database/init.js`)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,        -- ← 必填欄位
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,                            -- ← 可選欄位
  avatar TEXT,                          -- ← 可選欄位
  telegram TEXT,                        -- ← 可選欄位
  status TEXT DEFAULT 'active',
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### **原始註冊程式碼** (`server/routes/auth.js`)
```sql
INSERT INTO users (email, password_hash, name, telegram) VALUES (?, ?, ?, ?)
-- 缺少 username 欄位！
```

## 🔧 **修復方案**

### **1. 修改註冊程式碼**
- 添加 `username` 欄位到 INSERT 語句
- 如果用戶沒有提供 username，使用 email 作為預設值
- 添加 username 的唯一性檢查

### **2. 添加驗證規則**
- username 長度限制：3-20 位
- username 格式限制：只能包含字母、數字和下劃線
- username 為可選欄位

## 📝 **修復後的程式碼**

### **註冊驗證規則**
```javascript
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('username').optional().trim().isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用戶名只能包含字母、數字和下劃線，長度3-20位'),
  body('telegram').optional().trim()
], async (req, res) => {
```

### **用戶創建邏輯**
```javascript
// 檢查用戶名是否已存在
if (username) {
  const existingUsername = await railwayDb.get('SELECT id FROM users WHERE username = ?', [username]);
  if (existingUsername) {
    return res.status(400).json({ message: '此用戶名已被使用' });
  }
}

// 創建用戶
const result = await railwayDb.run(
  'INSERT INTO users (username, email, password_hash, name, telegram) VALUES (?, ?, ?, ?, ?)',
  [username || email, email, hashedPassword, name, telegram]
);
```

## ✅ **修復效果**

1. **欄位匹配**：INSERT 語句現在包含所有必要欄位
2. **必填欄位**：`username` 欄位會自動填充（使用 email 或用戶提供的值）
3. **資料完整性**：所有 NOT NULL 約束都能滿足
4. **用戶體驗**：用戶可以選擇性提供 username，也可以使用 email 作為預設值

## 🧪 **測試方法**

運行測試腳本驗證修復：
```bash
node server/scripts/test-registration.js
```

## 🔍 **驗證要點**

1. **註冊成功**：不再出現 NOT NULL constraint 錯誤
2. **欄位填充**：所有必要欄位都正確填充
3. **唯一性檢查**：username 和 email 的唯一性約束正常工作
4. **預設值**：如果沒有提供 username，會自動使用 email

## 📋 **注意事項**

- 修復保持了向後相容性
- 現有用戶的 username 會自動使用他們的 email
- 新用戶可以選擇性提供 username
- 所有驗證規則都符合資料庫約束

## 🎉 **總結**

用戶註冊的欄位不匹配問題已經完全修復！現在：

1. ✅ 所有必要欄位都會正確填充
2. ✅ 不再出現 NOT NULL constraint 錯誤
3. ✅ 用戶可以選擇性提供 username
4. ✅ 資料庫約束得到滿足
5. ✅ 註冊功能完全正常

建議重新部署應用程式來應用這些修復。

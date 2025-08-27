const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const railwayDb = require('../config/railway-db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');
const { generateResetToken, validateResetToken, markTokenAsUsed } = require('../services/tokenService');
const { getDatabaseConfig } = require('../config/env');

const router = express.Router();

// 處理 OPTIONS 預檢請求（跳過認證）
router.options('*', (req, res) => {
  console.log(`🔄 認證路由 OPTIONS 預檢請求: ${req.path}`);
  res.status(200).end();
});

// 獲取上傳路徑配置
const dbConfig = getDatabaseConfig();
const uploadPath = dbConfig.uploadPath;

// 配置 multer 用於處理檔案上傳
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 確保目錄存在
    const avatarPath = path.join(uploadPath, 'avatars');
    const fs = require('fs');
    
    if (!fs.existsSync(avatarPath)) {
      fs.mkdirSync(avatarPath, { recursive: true });
    }
    
    cb(null, avatarPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片檔案'));
    }
  }
});

// 註冊
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('username').optional().trim().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('用戶名只能包含字母、數字和下劃線，長度3-20位'),
  body('telegram').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { email, password, name, telegram, username } = req.body;

    console.log('🚀 開始註冊請求...')
    // 檢查郵箱是否已存在
    const existingUser = await railwayDb.get('SELECT id FROM users WHERE email = ?', [email]);
    console.log('🚀 檢查郵箱是否已存在...')
    if (existingUser) {
      return res.status(400).json({ message: '此郵箱已被註冊' });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🚀 加密密碼...')
    // 檢查用戶名是否已存在
    if (username) {
      const existingUsername = await railwayDb.get('SELECT id FROM users WHERE username = ?', [username]);
      if (existingUsername) {
        return res.status(400).json({ message: '此用戶名已被使用' });
      }
    }
    console.log('🚀 檢查用戶名是否已存在...')
    // 創建用戶
    const result = await railwayDb.run(
      'INSERT INTO users (username, email, password_hash, name, telegram) VALUES (?, ?, ?, ?, ?)',
      [username || email, email, hashedPassword, name, telegram]
    );
    console.log('🚀 創建用戶...')
    // 獲取新創建的用戶
    const user = await railwayDb.get('SELECT id, email, name, avatar, telegram, role, created_at FROM users WHERE id = ?', [result.lastID]);
    console.log('🚀 獲取新創建的用戶...')
    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    console.log('🚀 生成 JWT token...')
    // 發送歡迎郵件
    console.log('🚀 發送歡迎郵件...') 
    try {
      sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('發送歡迎郵件失敗:', emailError);
    }
    console.log('🚀 註冊成功...') 
    res.status(201).json({
      message: '註冊成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        telegram: user.telegram,
        role: user.role,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 登入
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { email, password } = req.body;

    // 查找用戶
    const user = await railwayDb.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ message: '郵箱或密碼錯誤' });
    }

    // 檢查用戶狀態
    if (user.status !== 'active') {
      return res.status(403).json({ message: '帳戶已被封鎖' });
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: '郵箱或密碼錯誤' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: '登入成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        telegram: user.telegram,
        role: user.role,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 獲取當前用戶資料
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await railwayDb.get('SELECT id, email, name, avatar, telegram, role, status, created_at FROM users WHERE id = ?', [req.user.userId]);

    if (!user) {
      return res.status(404).json({ message: '用戶不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 更新用戶資料
router.put('/profile', authenticateToken, upload.single('avatar'), [
  body('name').optional().trim().isLength({ min: 2 }),
  body('telegram').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { name, telegram } = req.body;
    const updateData = {};
    const params = [];

    // 構建更新查詢
    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    let paramIndex = 1;

    if (name) {
      query += ', name = ?';
      params.push(name);
    }

    if (telegram) {
      query += ', telegram = ?';
      params.push(telegram);
    }

    if (req.file) {
      query += ', avatar = ?';
      params.push(`/uploads/avatars/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(req.user.userId);

    await railwayDb.run(query, params);

    // 獲取更新後的用戶資料
    const user = await railwayDb.get('SELECT id, email, name, avatar, telegram, role, created_at FROM users WHERE id = ?', [req.user.userId]);

    res.json({
      message: '資料更新成功',
      user
    });
  } catch (error) {
    console.error('更新用戶資料錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 發送密碼重設郵件
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { email } = req.body;

    // 檢查用戶是否存在
    const user = await railwayDb.get('SELECT id, email, name FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(404).json({ message: '找不到此郵箱對應的帳戶' });
    }

    // 生成重設 token
    const resetToken = generateResetToken(user.email);

    // 儲存重設 token
    await railwayDb.run(
      'INSERT OR REPLACE INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, datetime("now", "+1 hour"))',
      [user.email, resetToken]
    );

    // 發送重設郵件
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({ message: '密碼重設郵件已發送' });
  } catch (error) {
    console.error('發送密碼重設郵件錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 重設密碼
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { token, password } = req.body;
    console.log('🚀 開始處理密碼重設請求');

    // 檢查 password_reset_tokens 表是否存在
    console.log('🔍 檢查 password_reset_tokens 表...');
    try {
      const tableExists = await railwayDb.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='password_reset_tokens'"
      );
      
      if (!tableExists) {
        console.log('❌ password_reset_tokens 表不存在，嘗試創建...');
        
        // 重試機制創建表
        let retryCount = 0;
        const maxRetries = 3;
        let tableCreated = false;
        
        while (retryCount < maxRetries && !tableCreated) {
          try {
            if (retryCount > 0) {
              console.log(`🔄 第 ${retryCount + 1} 次重試創建表...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // 創建表
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('創建表超時'));
              }, 30000); // 30秒超時
              
              railwayDb.run(`
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  email TEXT NOT NULL,
                  token TEXT NOT NULL UNIQUE,
                  expires_at DATETIME NOT NULL,
                  used INTEGER DEFAULT 0,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
              `, (err) => {
                clearTimeout(timeout);
                if (err) reject(err);
                else resolve();
              });
            });
            
            // 創建索引
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('創建索引超時'));
              }, 15000);
              
              railwayDb.run('CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email)', (err) => {
                clearTimeout(timeout);
                if (err) reject(err);
                else resolve();
              });
            });
            
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('創建索引超時'));
              }, 15000);
              
              railwayDb.run('CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token)', (err) => {
                clearTimeout(timeout);
                if (err) reject(err);
                else resolve();
              });
            });
            
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('創建索引超時'));
              }, 15000);
              
              railwayDb.run('CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at)', (err) => {
                clearTimeout(timeout);
                if (err) reject(err);
                else resolve();
              });
            });
            
            tableCreated = true;
            console.log('✅ password_reset_tokens 表創建成功');
            
          } catch (error) {
            retryCount++;
            console.error(`❌ 第 ${retryCount} 次創建表失敗:`, error.message);
            
            if (retryCount >= maxRetries) {
              console.error('❌ 創建表最終失敗，已重試', maxRetries, '次');
              throw new Error('無法創建必要的資料庫表');
            }
          }
        }
      } else {
        console.log('✅ password_reset_tokens 表已存在');
      }
    } catch (error) {
      console.error('❌ 檢查/創建表失敗:', error);
      return res.status(500).json({ message: '資料庫表創建失敗' });
    }

    // 驗證 token
    console.log('🔑 驗證重設 token...');
    const isValidToken = validateResetToken(token);
    if (!isValidToken) {
      console.log('❌ token 驗證失敗');
      return res.status(400).json({ message: '無效或已過期的重設 token' });
    }
    console.log('✅ token 驗證成功');

    // 查找 token 記錄
    console.log('🔍 查找 token 記錄...');
    const tokenRecord = await railwayDb.get(
      'SELECT email FROM password_reset_tokens WHERE token = ? AND expires_at > datetime("now") AND used = 0',
      [token]
    );

    if (!tokenRecord) {
      console.log('❌ token 記錄不存在或已過期');
      return res.status(400).json({ message: '無效或已過期的重設 token' });
    }
    console.log('✅ token 記錄找到:', tokenRecord.email);

    // 加密新密碼
    console.log('🔐 加密新密碼...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ 密碼加密完成');

    // 更新密碼
    console.log('💾 更新用戶密碼...');
    try {
      await railwayDb.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
        [hashedPassword, tokenRecord.email]
      );
      console.log('✅ 用戶密碼更新成功');
    } catch (error) {
      console.error('❌ 更新用戶密碼失敗:', error);
      return res.status(500).json({ message: '密碼更新失敗' });
    }

    // 標記 token 為已使用
    console.log('🏷️ 標記 token 為已使用...');
    try {
      await markTokenAsUsed(token);
      console.log('✅ token 標記成功');
    } catch (error) {
      console.error('❌ 標記 token 失敗:', error);
      // 即使標記失敗，密碼已經更新，所以不影響主要功能
      console.log('⚠️ token 標記失敗，但密碼已更新');
    }

    console.log('🎉 密碼重設完成');
    res.json({ message: '密碼重設成功' });
    
  } catch (error) {
    console.error('❌ 重設密碼錯誤:', error);
    
    if (error.message.includes('no such table')) {
      return res.status(500).json({ 
        message: '系統暫時無法處理密碼重設，請稍後再試',
        error: '資料庫表缺失'
      });
    }
    
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
});

module.exports = router;

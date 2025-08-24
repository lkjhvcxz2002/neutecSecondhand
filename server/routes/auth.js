const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');
const { generateResetToken, validateResetToken, markTokenAsUsed } = require('../services/tokenService');

const router = express.Router();

// 配置 multer 用於處理檔案上傳
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
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
  body('telegram').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { email, password, name, telegram } = req.body;

    // 檢查郵箱是否已存在
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }
      
      if (row) {
        return res.status(400).json({ message: '此郵箱已被註冊' });
      }

      // 加密密碼
      const hashedPassword = await bcrypt.hash(password, 10);

      // 創建用戶
      db.run(
        'INSERT INTO users (email, password, name, telegram) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, telegram],
        function(err) {
          if (err) {
            return res.status(500).json({ message: '創建用戶失敗' });
          }

          // 獲取新創建的用戶
          db.get('SELECT id, email, name, avatar, telegram, role, created_at FROM users WHERE id = ?', 
            [this.lastID], async (err, user) => {
            if (err) {
              return res.status(500).json({ message: '獲取用戶資料失敗' });
            }

            // 生成 JWT token
            const token = jwt.sign(
              { userId: user.id, email: user.email, role: user.role },
              process.env.JWT_SECRET || 'your-secret-key',
              { expiresIn: '7d' }
            );

            // 發送歡迎郵件（非同步，不影響註冊流程）
            try {
              await sendWelcomeEmail(email, name);
            } catch (emailError) {
              console.error('發送歡迎郵件失敗:', emailError);
              // 不影響註冊成功
            }

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
          });
        }
      );
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

    // 先查找用戶（不限制狀態）
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }

      if (!user) {
        return res.status(401).json({ message: '郵箱或密碼錯誤' });
      }

      // 檢查用戶狀態
      if (user.status !== 'active') {
        return res.status(403).json({ message: '帳戶已被封鎖' });
      }

      // 驗證密碼
      const isValidPassword = await bcrypt.compare(password, user.password);
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
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 獲取當前用戶資料
router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, name, avatar, telegram, role, status, created_at FROM users WHERE id = ?', 
    [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }

    if (!user) {
      return res.status(404).json({ message: '用戶不存在' });
    }

    res.json({ user });
  });
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
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (telegram !== undefined) {
      updateFields.push('telegram = ?');
      updateValues.push(telegram);
    }

    if (avatar) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: '沒有要更新的資料' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(req.user.userId);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

    db.run(query, updateValues, function(err) {
      if (err) {
        return res.status(500).json({ message: '更新資料失敗' });
      }

      // 獲取更新後的用戶資料
      db.get('SELECT id, email, name, avatar, telegram, role, status, created_at FROM users WHERE id = ?', 
        [req.user.userId], (err, user) => {
        if (err) {
          return res.status(500).json({ message: '獲取用戶資料失敗' });
        }

        res.json({
          message: '資料更新成功',
          user
        });
      });
    });
  } catch (error) {
    console.error('更新資料錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 忘記密碼
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { email } = req.body;

    // 檢查用戶是否存在
    db.get('SELECT id, name, status FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }

      if (!user) {
        // 為了安全，即使用戶不存在也返回成功訊息
        return res.json({ message: '如果郵箱存在，重設密碼連結已發送' });
      }

      // 檢查用戶狀態
      if (user.status !== 'active') {
        return res.status(403).json({ message: '帳戶已被封鎖，無法重設密碼' });
      }

      // 生成重設密碼令牌
      const resetToken = generateResetToken(user.id);

      // 發送重設密碼郵件
      try {
        const emailResult = await sendPasswordResetEmail(email, user.name, resetToken);
        
        if (emailResult.success) {
          res.json({ 
            message: '重設密碼連結已發送到您的郵箱',
            note: '請檢查您的郵箱並點擊連結重設密碼'
          });
        } else {
          res.status(500).json({ 
            message: '發送郵件失敗，請稍後再試或聯繫管理員',
            error: emailResult.error
          });
        }
      } catch (emailError) {
        console.error('發送重設密碼郵件失敗:', emailError);
        res.status(500).json({ 
          message: '發送郵件失敗，請稍後再試或聯繫管理員'
        });
      }
    });
  } catch (error) {
    console.error('忘記密碼錯誤:', error);
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

    // 驗證令牌
    const tokenValidation = validateResetToken(token);
    if (!tokenValidation.valid) {
      return res.status(400).json({ message: tokenValidation.message });
    }

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 更新用戶密碼
    db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, tokenValidation.userId],
      function(err) {
        if (err) {
          return res.status(500).json({ message: '更新密碼失敗' });
        }

        // 標記令牌為已使用
        markTokenAsUsed(token);

        res.json({ message: '密碼重設成功，請使用新密碼登入' });
      }
    );
  } catch (error) {
    console.error('重設密碼錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;

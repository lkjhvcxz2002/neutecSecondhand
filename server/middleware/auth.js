const jwt = require('jsonwebtoken');

// JWT 認證中間件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: '缺少認證 token' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token 無效或已過期' });
    }

    req.user = user;
    next();
  });
}

// 管理員權限檢查中間件
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理員權限' });
  }
  next();
}

// 檢查用戶是否為商品擁有者或管理員
function requireOwnerOrAdmin(req, res, next) {
  const { userId, role } = req.user;
  const productId = req.params.id;

  // 如果是管理員，直接通過
  if (role === 'admin') {
    return next();
  }

  // 檢查商品是否屬於當前用戶
  const { db } = require('../database/init');
  db.get('SELECT user_id FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }

    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    if (product.user_id !== userId) {
      return res.status(403).json({ message: '沒有權限操作此商品' });
    }

    next();
  });
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnerOrAdmin
};

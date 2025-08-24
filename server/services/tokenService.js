const crypto = require('crypto');

// 存儲重設密碼令牌（在生產環境中應該使用 Redis 或資料庫）
const resetTokens = new Map();

// 生成重設密碼令牌
const generateResetToken = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1小時後過期
  
  resetTokens.set(token, {
    userId,
    expiresAt,
    used: false
  });
  
  // 清理過期的令牌
  cleanupExpiredTokens();
  
  return token;
};

// 驗證重設密碼令牌
const validateResetToken = (token) => {
  const tokenData = resetTokens.get(token);
  
  if (!tokenData) {
    return { valid: false, message: '無效的重設密碼令牌' };
  }
  
  if (tokenData.used) {
    return { valid: false, message: '此令牌已被使用' };
  }
  
  if (new Date() > tokenData.expiresAt) {
    resetTokens.delete(token);
    return { valid: false, message: '重設密碼令牌已過期' };
  }
  
  return { 
    valid: true, 
    userId: tokenData.userId,
    message: '令牌有效'
  };
};

// 標記令牌為已使用
const markTokenAsUsed = (token) => {
  const tokenData = resetTokens.get(token);
  if (tokenData) {
    tokenData.used = true;
    resetTokens.set(token, tokenData);
  }
};

// 清理過期的令牌
const cleanupExpiredTokens = () => {
  const now = new Date();
  for (const [token, tokenData] of resetTokens.entries()) {
    if (now > tokenData.expiresAt) {
      resetTokens.delete(token);
    }
  }
};

// 獲取令牌統計資訊
const getTokenStats = () => {
  const now = new Date();
  let activeTokens = 0;
  let expiredTokens = 0;
  let usedTokens = 0;
  
  for (const tokenData of resetTokens.values()) {
    if (tokenData.used) {
      usedTokens++;
    } else if (now > tokenData.expiresAt) {
      expiredTokens++;
    } else {
      activeTokens++;
    }
  }
  
  return {
    total: resetTokens.size,
    active: activeTokens,
    expired: expiredTokens,
    used: usedTokens
  };
};

module.exports = {
  generateResetToken,
  validateResetToken,
  markTokenAsUsed,
  getTokenStats
};

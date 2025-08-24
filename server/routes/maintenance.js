const express = require('express');
const { db } = require('../database/init');

const router = express.Router();

// 公開的維護狀態檢查 API（不需要認證）
router.get('/status', (req, res) => {
  try {
    db.get('SELECT value FROM system_settings WHERE key = "maintenance_mode"', (err, result) => {
      if (err) {
        console.error('獲取維護模式狀態錯誤:', err);
        return res.status(500).json({ 
          success: false,
          message: '資料庫錯誤',
          maintenanceMode: false 
        });
      }

      const isMaintenanceMode = result ? result.value === 'true' : false;
      res.json({ 
        success: true,
        maintenanceMode: isMaintenanceMode,
        message: '維護模式狀態已獲取'
      });
    });
  } catch (error) {
    console.error('獲取維護模式狀態錯誤:', error);
    res.status(500).json({ 
      success: false,
      message: '伺服器錯誤',
      maintenanceMode: false 
    });
  }
});

module.exports = router;

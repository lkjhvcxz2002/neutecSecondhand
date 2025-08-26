const express = require('express');
const railwayDb = require('../config/railway-db');

const router = express.Router();

// 公開的維護狀態檢查 API（不需要認證）
router.get('/status', async (req, res) => {
  try {
    const result = await railwayDb.get('SELECT value FROM system_settings WHERE key = "maintenance_mode"');
    
    const isMaintenanceMode = result ? result.value === 'true' : false;
    res.json({ 
      success: true,
      maintenanceMode: isMaintenanceMode,
      message: '維護模式狀態已獲取'
    });
  } catch (error) {
    console.error('獲取維護模式狀態錯誤:', error);
    res.status(500).json({ 
      success: false,
      message: '資料庫錯誤',
      maintenanceMode: false 
    });
  }
});

module.exports = router;

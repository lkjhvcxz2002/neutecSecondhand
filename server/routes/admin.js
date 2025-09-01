const express = require('express');
const { body, validationResult, query } = require('express-validator');
const railwayDb = require('../config/railway-db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 處理 OPTIONS 預檢請求（跳過認證）
router.options('*', (req, res) => {
  console.log(`🔄 管理員路由 OPTIONS 預檢請求: ${req.path}`);
  res.status(200).end();
});

// 所有管理員路由都需要管理員權限（除了 OPTIONS）
router.use(authenticateToken, requireAdmin);

// 獲取所有用戶
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'suspended']),
  query('search').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '查詢參數驗證失敗', errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let offset = (page - 1) * limit;

    if (status) {
      whereConditions.push('status = ?');
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 獲取用戶總數
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;

    railwayDb.get(countQuery, queryParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }

      const total = countResult.total;

      // 獲取用戶列表
      const usersQuery = `
        SELECT id, email, name, avatar, telegram, role, status, created_at, updated_at
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      const finalParams = [...queryParams, limit, offset];

      railwayDb.all(usersQuery, finalParams, (err, users) => {
        if (err) {
          return res.status(500).json({ message: '資料庫錯誤' });
        }

        res.json({
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      });
    });
  } catch (error) {
    console.error('獲取用戶錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 更新用戶狀態
router.patch('/users/:id/status', [
  body('status').isIn(['active', 'suspended'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // 檢查是否為自己
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ message: '不能停權自己的帳號' });
    }

    const query = 'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

    railwayDb.run(query, [status, id], function(err) {
      if (err) {
        return res.status(500).json({ message: '更新狀態失敗' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: '用戶不存在' });
      }

      res.json({ 
        message: `用戶狀態已更新為 ${status === 'active' ? '啟用' : '停權'}` 
      });
    });
  } catch (error) {
    console.error('更新用戶狀態錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 更新用戶角色
router.patch('/users/:id/role', [
  body('role').isIn(['user', 'admin'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { id } = req.params;
    const { role } = req.body;

    // 檢查是否為自己
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ message: '不能修改自己的角色' });
    }

    const query = 'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

    railwayDb.run(query, [role, id], function(err) {
      if (err) {
        return res.status(500).json({ message: '更新角色失敗' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: '用戶不存在' });
      }

      res.json({ 
        message: `用戶角色已更新為 ${role === 'admin' ? '管理員' : '一般用戶'}` 
      });
    });
  } catch (error) {
    console.error('更新用戶角色錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 獲取所有商品（管理員視角）
router.get('/products', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'sold', 'expired', 'removed']),
  query('category').optional().trim(),
  query('search').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '查詢參數驗證失敗', errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      status,
      category,
      search
    } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let offset = (page - 1) * limit;

    if (status) {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }

    if (category) {
      whereConditions.push('p.category = ?');
      queryParams.push(category);
    }

    if (search) {
      whereConditions.push('(p.title LIKE ? OR p.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 獲取商品總數
    const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;

    railwayDb.get(countQuery, queryParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }

      const total = countResult.total;

      // 獲取商品列表
      const productsQuery = `
        SELECT 
          p.*,
          u.name as seller_name,
          u.email as seller_email,
          u.telegram as seller_telegram
        FROM products p
        JOIN users u ON p.user_id = u.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const finalParams = [...queryParams, limit, offset];

      railwayDb.all(productsQuery, finalParams, (err, products) => {
        if (err) {
          return res.status(500).json({ message: '資料庫錯誤' });
        }

        // 處理圖片路徑
        const processedProducts = products.map(product => {
          if (product.images) {
            try {
              product.images = JSON.parse(product.images);
            } catch (e) {
              product.images = [];
            }
          } else {
            product.images = [];
          }
          return product;
        });

        res.json({
          products: processedProducts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      });
    });
  } catch (error) {
    console.error('獲取商品錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 管理員下架商品
router.patch('/products/:id/status', [
  body('status').isIn(['active', 'expired', 'removed'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const query = 'UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

    railwayDb.run(query, [status, id], function(err) {
      if (err) {
        return res.status(500).json({ message: '更新狀態失敗' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: '商品不存在' });
      }

      res.json({ 
        message: `商品狀態已更新為 ${status === 'active' ? '上架' : '下架'}` 
      });
    });
  } catch (error) {
    console.error('更新商品狀態錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 獲取系統統計資料
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 開始獲取系統統計資料...');
    
    // 檢查資料庫連接
    if (!railwayDb.isConnected()) {
      console.error('❌ 資料庫未連接');
      return res.status(500).json({ message: '資料庫連接失敗' });
    }

    console.log('✅ 資料庫連接正常，開始執行查詢...');

    // 使用 Promise 包裝 railwayDb 查詢，添加超時處理
    const executeQuery = (queryFunc, queryName) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`${queryName} 查詢超時`));
        }, 10000); // 10秒超時
        
        try {
          queryFunc((err, result) => {
            clearTimeout(timeout);
            if (err) {
              console.error(`❌ ${queryName} 查詢失敗:`, err);
              reject(err);
            } else {
              console.log(`✅ ${queryName} 查詢成功:`, result);
              resolve(result);
            }
          });
        } catch (error) {
          clearTimeout(timeout);
          console.error(`❌ ${queryName} 查詢異常:`, error);
          reject(error);
        }
      });
    };

    const getUserStats = () => executeQuery(
      (callback) => railwayDb.get('SELECT COUNT(*) as total_users FROM users', callback),
      '用戶統計'
    );

    const getProductStats = () => executeQuery(
      (callback) => railwayDb.get('SELECT COUNT(*) as total_products FROM products', callback),
      '商品統計'
    );

    const getActiveProductStats = () => executeQuery(
      (callback) => railwayDb.get('SELECT COUNT(*) as active_products FROM products WHERE status = "active"', callback),
      '活躍商品統計'
    );

    const getCategoryStats = () => executeQuery(
      (callback) => railwayDb.all('SELECT category, COUNT(*) as count FROM products GROUP BY category', callback),
      '分類統計'
    );

    console.log('🚀 準備循序執行查詢...');

    // 循序執行查詢，避免資料庫鎖定
    console.log('1/4 執行商品統計查詢...');
    const productStats = await getProductStats();
    console.log('✅ 商品統計完成:', productStats);

    console.log('2/4 執行活躍商品統計查詢...');
    const activeStats = await getActiveProductStats();
    console.log('✅ 活躍商品統計完成:', activeStats);

    console.log('3/4 執行分類統計查詢...');
    const categoryStats = await getCategoryStats();
    console.log('✅ 分類統計完成:', categoryStats);

    console.log('4/4 執行用戶統計查詢...');
    const userStats = await getUserStats();
    console.log('✅ 用戶統計完成:', userStats);

    console.log('✅ 所有查詢循序完成');
    console.log('📊 統計資料查詢完成:', {
      users: userStats.total_users,
      products: productStats.total_products,
      active: activeStats.active_products,
      categories: categoryStats.length
    });

    res.json({
      stats: {
        totalUsers: userStats.total_users,
        totalProducts: productStats.total_products,
        activeProducts: activeStats.active_products,
        categoryBreakdown: categoryStats
      }
    });

  } catch (error) {
    console.error('❌ 獲取統計資料錯誤:', error);
    
    // 根據錯誤類型返回不同的錯誤訊息
    if (error.message.includes('超時')) {
      return res.status(408).json({ 
        message: '查詢超時，請稍後再試',
        error: error.message 
      });
    }
    
    if (error.message.includes('資料庫')) {
      return res.status(500).json({ 
        message: '資料庫錯誤，請檢查資料庫連接',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: '獲取統計資料失敗',
      error: error.message 
    });
  }
});

// 緊急統計 API - 簡化版本，避免複雜查詢
router.get('/stats/simple', async (req, res) => {
  try {
    console.log('🚨 使用緊急簡化統計 API...');
    
    // 檢查資料庫連接
    if (!railwayDb.isConnected()) {
      console.error('❌ 資料庫未連接');
      return res.status(500).json({ message: '資料庫連接失敗' });
    }

    // 只執行最基本的查詢
    let userCount = 0;
    let productCount = 0;
    
    try {
      // 等待資料庫連接
      console.log('⏳ 等待資料庫連接...');
      await railwayDb.waitForConnection(10000);
      console.log('✅ 資料庫連接就緒');
      
      // 用戶數量查詢
      console.log('🔍 開始執行用戶統計查詢...');
      const userResult = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('用戶統計查詢超時'));
        }, 5000);
        
        railwayDb.get('SELECT COUNT(*) as count FROM users', (err, result) => {
          clearTimeout(timeout);
          if (err) {
            console.error('❌ 用戶統計查詢資料庫錯誤:', err);
            reject(err);
          } else {
            console.log('📊 用戶統計查詢原始結果:', result);
            resolve(result);
          }
        });
      });
      userCount = userResult.count;
      console.log('✅ 用戶統計查詢成功:', userCount);
      
    } catch (error) {
      console.error('❌ 用戶統計查詢失敗:', error);
      userCount = -1; // 標記為錯誤
    }
    
    try {
      // 商品數量查詢
      console.log('🔍 開始執行商品統計查詢...');
      const productResult = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('商品統計查詢超時'));
        }, 5000);
        
        railwayDb.get('SELECT COUNT(*) as count FROM products', (err, result) => {
          clearTimeout(timeout);
          if (err) {
            console.error('❌ 商品統計查詢資料庫錯誤:', err);
            reject(err);
          } else {
            console.log('📊 商品統計查詢原始結果:', result);
            resolve(result);
          }
        });
      });
      productCount = productResult.count;
      console.log('✅ 商品統計查詢成功:', productCount);
      
    } catch (error) {
      console.error('❌ 商品統計查詢失敗:', error);
      productCount = -1; // 標記為錯誤
    }

    // 返回簡化結果
    const stats = {
      totalUsers: userCount >= 0 ? userCount : '查詢失敗',
      totalProducts: productCount >= 0 ? productCount : '查詢失敗',
      activeProducts: '簡化模式',
      categoryBreakdown: [],
      mode: 'emergency_simple'
    };

    console.log('📊 簡化統計完成:', stats);
    res.json({ stats });

  } catch (error) {
    console.error('❌ 簡化統計 API 錯誤:', error);
    res.status(500).json({ 
      message: '簡化統計失敗',
      error: error.message 
    });
  }
});

// 獲取系統設定
router.get('/settings', (req, res) => {
  try {
    railwayDb.all('SELECT * FROM system_settings', (err, settings) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }

      const settingsMap = {};
      settings.forEach(setting => {
        settingsMap[setting.key] = {
          value: setting.value,
          description: setting.description
        };
      });

      res.json({ settings: settingsMap });
    });
  } catch (error) {
    console.error('獲取系統設定錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 更新系統設定
router.put('/settings/:key', [
  body('value').notEmpty()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { key } = req.params;
    const { value } = req.body;

    const query = 'UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?';

    railwayDb.run(query, [value, key], function(err) {
      if (err) {
        return res.status(500).json({ message: '更新設定失敗' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: '設定項目不存在' });
      }

      res.json({ 
        message: '系統設定已更新',
        setting: { key, value }
      });
    });
  } catch (error) {
    console.error('更新系統設定錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 獲取維護模式狀態
router.get('/maintenance', (req, res) => {
  try {
    railwayDb.get('SELECT setting_value FROM system_settings WHERE setting_key = "maintenance_mode"', (err, result) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }

      const isMaintenanceMode = result ? result.setting_value === 'true' : false;
      res.json({ 
        maintenanceMode: isMaintenanceMode,
        message: '維護模式狀態已獲取'
      });
    });
  } catch (error) {
    console.error('獲取維護模式狀態錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 切換維護模式
router.post('/maintenance/toggle', (req, res) => {
  try {
    // 先獲取當前狀態
    railwayDb.get('SELECT setting_value FROM system_settings WHERE setting_key = "maintenance_mode"', (err, result) => {
      console.log(result);
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }

      const currentMode = result ? result.setting_value === 'true' : false;
      const newMode = !currentMode;
      const newValue = newMode.toString();

      // 更新或插入維護模式設定
      const upsertQuery = `
        INSERT OR REPLACE INTO system_settings (setting_key, setting_value, description, updated_at) 
        VALUES ('maintenance_mode', ?, '系統維護模式', CURRENT_TIMESTAMP)
      `;

      railwayDb.run(upsertQuery, [newValue], function(err) {
        if (err) {
          return res.status(500).json({ message: '更新維護模式失敗' });
        }

        // 記錄操作日誌
        const logQuery = `
          INSERT INTO admin_logs (admin_id, action, details, ip_address, created_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        
        const logDetails = `維護模式${newMode ? '啟用' : '關閉'}`;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        
        railwayDb.run(logQuery, [req.user.userId, 'toggle_maintenance', logDetails, ipAddress], (logErr) => {
          if (logErr) {
            console.error('記錄操作日誌失敗:', logErr);
          }
        });

        res.json({ 
          message: `維護模式已${newMode ? '啟用' : '關閉'}`,
          maintenanceMode: newMode
        });
      });
    });
  } catch (error) {
    console.error('切換維護模式錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;

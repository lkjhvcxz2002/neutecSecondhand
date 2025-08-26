const express = require('express');
const { body, validationResult, query } = require('express-validator');
const railwayDb = require('../config/railway-db');
const { authenticateToken, requireOwnerOrAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabaseConfig } = require('../config/env');

const router = express.Router();

// 獲取上傳路徑配置
const dbConfig = getDatabaseConfig();
const uploadPath = dbConfig.uploadPath;

// 配置 multer 用於處理商品圖片上傳
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(uploadPath, 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片檔案'));
    }
  }
});

// 獲取所有商品（支援分頁和篩選）
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().trim(),
  query('status').optional().isIn(['active', 'sold', 'expired', 'removed']),
  query('search').optional().trim(),
  query('minPrice').optional().isInt({ min: 0 }),
  query('maxPrice').optional().isInt({ min: 0 }),
  query('tradeType').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '查詢參數驗證失敗', errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      category,
      status = 'active',
      search,
      minPrice,
      maxPrice,
      tradeType
    } = req.query;

    let whereConditions = ['p.status = ?'];
    let queryParams = [status];

    // 如果狀態為 active，則查詢 active 和 processing 的商品
    if(status === 'active') {
      whereConditions = ['p.status IN (?, ?)'];
      queryParams = ['active', 'processing'];
    }
    let offset = (page - 1) * limit;

    if (category) {
      whereConditions.push('p.category = ?');
      queryParams.push(category);
    }

    if (search) {
      whereConditions.push('(p.title LIKE ? OR p.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice !== undefined) {
      whereConditions.push('p.price >= ?');
      queryParams.push(minPrice);
    }

    if (maxPrice !== undefined) {
      whereConditions.push('p.price <= ?');
      queryParams.push(maxPrice);
    }

    if (tradeType) {
      whereConditions.push('p.trade_type = ?');
      queryParams.push(tradeType);
    }

    const whereClause = whereConditions.join(' AND ');

    // 獲取商品總數
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      WHERE ${whereClause}
    `;

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
          u.telegram as seller_telegram
        FROM products p
        JOIN users u ON p.user_id = u.id
        WHERE ${whereClause}
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

// 獲取用戶商品
router.get('/my-products', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    
    const query = `
      SELECT 
        p.*,
        u.name as seller_name,
        u.telegram as seller_telegram
      FROM products p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `;

    railwayDb.all(query, [userId], (err, products) => {
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
        total: processedProducts.length
      });
    });
  } catch (error) {
    console.error('獲取用戶商品錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 獲取單個商品詳情
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      p.*,
      u.name as seller_name,
      u.telegram as seller_telegram,
      u.avatar as seller_avatar
    FROM products p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `;

      railwayDb.get(query, [id], (err, product) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }

    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 處理圖片路徑
    if (product.images) {
      try {
        product.images = JSON.parse(product.images);
      } catch (e) {
        product.images = [];
      }
    } else {
      product.images = [];
    }

    res.json({ product });
  });
});

// 創建新商品
router.post('/', authenticateToken, upload.array('images', 5), [
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('description').trim().isLength({ max: 1000 }),
  body('price').isInt({ min: 0 }),
  body('category').trim().isLength({ min: 1 }),
  body('tradeType').trim().isLength({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { title, description, price, category, tradeType } = req.body;
    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];
    
    console.log(`📸 商品圖片路徑:`, images);
    console.log(`📁 實際上傳路徑: ${uploadPath}/products/`);

    const query = `
      INSERT INTO products (user_id, title, description, price, category, trade_type, images)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    railwayDb.run(query, [req.user.userId, title, description, price, category, tradeType, JSON.stringify(images)], function(err) {
      if (err) {
        return res.status(500).json({ message: '創建商品失敗' });
      }

      // 獲取新創建的商品
      const getProductQuery = `
        SELECT 
          p.*,
          u.name as seller_name,
          u.telegram as seller_telegram
        FROM products p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `;

      railwayDb.get(getProductQuery, [this.lastID], (err, product) => {
        if (err) {
          return res.status(500).json({ message: '獲取商品資料失敗' });
        }

        if (product.images) {
          try {
            product.images = JSON.parse(product.images);
          } catch (e) {
            product.images = [];
          }
        }

        res.status(201).json({
          message: '商品創建成功',
          product
        });
      });
    });
  } catch (error) {
    console.error('創建商品錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 更新商品
router.put('/:id', authenticateToken, requireOwnerOrAdmin, upload.array('images', 5), [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('price').optional().isInt({ min: 0 }),
  body('category').optional().trim().isLength({ min: 1 }),
  body('trade_type').optional().trim().isLength({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '輸入資料驗證失敗', errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, price, category, trade_type } = req.body;
    const newImages = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : null;
    
    console.log(`📸 更新商品圖片路徑:`, newImages);
    console.log(`📁 實際上傳路徑: ${uploadPath}/products/`);

    // 獲取現有商品資料
    railwayDb.get('SELECT images FROM products WHERE id = ?', [id], (err, existingProduct) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }

      if (!existingProduct) {
        return res.status(404).json({ message: '商品不存在' });
      }

      let images = existingProduct.images;
      if (newImages) {
        try {
          const currentImages = JSON.parse(images || '[]');
          images = JSON.stringify([...currentImages, ...newImages]);
        } catch (e) {
          images = JSON.stringify(newImages);
        }
      }

      let updateFields = [];
      let updateValues = [];

      if (title) {
        updateFields.push('title = ?');
        updateValues.push(title);
      }

      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }

      if (price !== undefined) {
        updateFields.push('price = ?');
        updateValues.push(price);
      }

      if (category) {
        updateFields.push('category = ?');
        updateValues.push(category);
      }

      if (trade_type) {
        updateFields.push('trade_type = ?');
        updateValues.push(trade_type);
      }

      if (newImages) {
        updateFields.push('images = ?');
        updateValues.push(images);
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;

      railwayDb.run(query, updateValues, function(err) {
        if (err) {
          return res.status(500).json({ message: '更新商品失敗' });
        }

        // 獲取更新後的商品
        const getProductQuery = `
          SELECT 
            p.*,
            u.name as seller_name,
            u.telegram as seller_telegram
          FROM products p
          JOIN users u ON p.user_id = u.id
          WHERE p.id = ?
        `;

        railwayDb.get(getProductQuery, [id], (err, product) => {
          if (err) {
            return res.status(500).json({ message: '獲取商品資料失敗' });
          }

          if (product.images) {
            try {
              product.images = JSON.parse(product.images);
            } catch (e) {
              product.images = [];
            }
          }

          res.json({
            message: '商品更新成功',
            product
          });
        });
      });
    });
  } catch (error) {
    console.error('更新商品錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 更新商品狀態
router.patch('/:id/status', authenticateToken, requireOwnerOrAdmin, [
  body('status').isIn(['active', 'processing', 'sold', 'expired', 'removed'])
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
        return res.status(500).json({ message: '更新狀態失敗' + JSON.stringify(err) });
      }

      // 獲取更新後的商品
      const getProductQuery = `
        SELECT 
          p.*,
          u.name as seller_name,
          u.telegram as seller_telegram
        FROM products p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `;

      railwayDb.get(getProductQuery, [id], (err, product) => {
        if (err) {
          return res.status(500).json({ message: '獲取商品資料失敗' });
        }

        if (product.images) {
          try {
            product.images = JSON.parse(product.images);
          } catch (e) {
            product.images = [];
          }
        }

        res.json({
          message: '狀態更新成功',
          product
        });
      });
    });
  } catch (error) {
    console.error('更新狀態錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 刪除商品
router.delete('/:id', authenticateToken, requireOwnerOrAdmin, (req, res) => {
  const { id } = req.params;

  // 獲取商品圖片以便刪除檔案
  railwayDb.get('SELECT images FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }

    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 刪除商品
    railwayDb.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: '刪除商品失敗' });
      }

      // 刪除相關的圖片檔案
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          images.forEach(imagePath => {
            const fullPath = path.join(__dirname, '..', imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          });
        } catch (e) {
          console.error('刪除圖片檔案失敗:', e);
        }
      }

      res.json({ message: '商品刪除成功' });
    });
  });
});

// 獲取商品分類
router.get('/categories/list', (req, res) => {
  const categories = ['服飾', '鞋包', '日常用品'];
  res.json({ categories });
});

module.exports = router;

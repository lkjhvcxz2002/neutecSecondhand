const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// 根据环境选择数据库路径
const getDatabasePath = () => {
  // 检查是否在 Railway 环境
  const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || 
                    process.env.RAILWAY_PROJECT_ID || 
                    process.env.RAILWAY_SERVICE_NAME;
  
  if (isRailway) {
    // Railway 环境使用 Volume 路径
    return '/data/database.db';
  } else {
    // 本地开发环境
    return path.join(__dirname, 'database.sqlite');
  }
};

const dbPath = getDatabasePath();
console.log(`🗄️ 使用数据库路径: ${dbPath}`);

// 动态创建数据库连接
let db = null;

const getDatabase = () => {
  if (!db) {
    db = new sqlite3.Database(dbPath);
  }
  return db;
};

// 初始化資料庫
async function initDatabase() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    database.serialize(() => {
      // 建立用戶表
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT,
          avatar TEXT,
          telegram TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended')),
          role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.log(`❌ users 表創建失敗: ${err.message}`);
        } else {
          console.log('✅ users 表創建成功');
        }
      });

      // 建立商品表
      database.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          price REAL,
          category TEXT NOT NULL,
          trade_type TEXT NOT NULL,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'removed', 'processing')),
          images TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.log(`❌ products 表創建失敗: ${err.message}`);
        } else {
          console.log('✅ products 表創建成功');
        }
      });

      // 建立商品圖片表
      database.run(`
        CREATE TABLE IF NOT EXISTS product_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          image_path TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `, (err) => {
        if (err) {
          console.log(`❌ product_images 表創建失敗: ${err.message}`);
        } else {
          console.log('✅ product_images 表創建成功');
        }
      });

      // 建立系統設定表
      database.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_key TEXT UNIQUE NOT NULL,
          setting_value TEXT,
          setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
          description TEXT,
          is_public INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.log(`❌ system_settings 表創建失敗: ${err.message}`);
        } else {
          console.log('✅ system_settings 表創建成功');
        }
      });

      // 建立維護模式表
      database.run(`
        CREATE TABLE IF NOT EXISTS maintenance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          enabled INTEGER DEFAULT 0,
          message TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.log(`❌ maintenance 表創建失敗: ${err.message}`);
        } else {
          console.log('✅ maintenance 表創建成功');
        }
      });

      // 建立管理員操作日誌表
      database.run(`
        CREATE TABLE IF NOT EXISTS admin_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          admin_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          details TEXT,
          ip_address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          console.log(`❌ admin_logs 表創建失敗: ${err.message}`);
        } else {
          console.log('✅ admin_logs 表創建成功');
        }
      });

      // 建立密碼重設 token 表
      database.run(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires_at DATETIME NOT NULL,
          used INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_token (token),
          INDEX idx_expires (expires_at)
        )
      `, (err) => {
        if (err) {
          console.log(`❌ password_reset_tokens 表創建失敗: ${err.message}`);
        } else {
          console.log('✅ password_reset_tokens 表創建成功');
        }
      });

      // 插入預設管理員帳號
      database.get("SELECT id FROM users WHERE email = 'admin@company.com'", (err, row) => {
        if (!row) {
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          database.run(`
            INSERT INTO users (email, password_hash, name, role, username) 
            VALUES (?, ?, ?, ?, ?)
          `, ['admin@company.com', hashedPassword, '系統管理員', 'admin', 'admin'], (err) => {
            if (err) {
              console.log(`❌ 管理員帳號插入失敗: ${err.message}`);
            } else {
              console.log('✅ 預設管理員帳號已建立: admin@company.com / admin123');
            }
          });
        } else {
          console.log('✅ 管理員帳號已存在');
        }
      });

      // 插入預設系統設定
      database.run(`
        INSERT OR IGNORE INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES 
        ('maintenance_mode', 'false', 'boolean', '系統維護模式', 1),
        ('max_images_per_product', '5', 'string', '每個商品最大圖片數量', 1),
        ('max_product_price', '999999', 'number', '商品最大價格', 1),
        ('allowed_categories', '電子產品,服飾,書籍,家具,其他', 'string', '允許的商品分類', 1)
      `, (err) => {
        if (err) {
          console.log(`❌ 系統設定插入失敗: ${err.message}`);
        } else {
          console.log('✅ 系統設定插入成功');
        }
      });

      // 插入維護模式初始狀態
      database.run(`
        INSERT OR IGNORE INTO maintenance (enabled, message) 
        VALUES (?, ?)
      `, [0, '系統正常運行中'], (err) => {
        if (err) {
          console.log(`❌ 維護狀態插入失敗: ${err.message}`);
        } else {
          console.log('✅ 維護狀態插入成功');
        }
      });

      // 建立索引
      database.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
        if (err) console.log(`❌ 用戶郵箱索引創建失敗: ${err.message}`);
        else console.log('✅ 用戶郵箱索引創建成功');
      });
      
      database.run('CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)', (err) => {
        if (err) console.log(`❌ 商品用戶索引創建失敗: ${err.message}`);
        else console.log('✅ 商品用戶索引創建成功');
      });
      
      database.run('CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)', (err) => {
        if (err) console.log(`❌ 商品狀態索引創建失敗: ${err.message}`);
        else console.log('✅ 商品狀態索引創建成功');
      });
      
      database.run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)', (err) => {
        if (err) console.log(`❌ 商品分類索引創建失敗: ${err.message}`);
        else console.log('✅ 商品分類索引創建成功');
      });

      database.run('PRAGMA foreign_keys = ON');
      
      console.log('資料庫表結構建立完成');
      resolve();
    });
  });
}

// 關閉資料庫連接
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDatabase,
  initDatabase,
  closeDatabase
};

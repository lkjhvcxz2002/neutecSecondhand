const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 初始化資料庫
async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 建立用戶表
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          avatar TEXT,
          telegram TEXT,
          role TEXT DEFAULT 'user',
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 建立商品表
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          price INTEGER NOT NULL,
          category TEXT NOT NULL,
          trade_type TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          images TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // 建立商品圖片表
      db.run(`
        CREATE TABLE IF NOT EXISTS product_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          image_path TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // 建立系統設定表
      db.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          description TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 建立管理員操作日誌表
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          admin_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          details TEXT,
          ip_address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES users (id)
        )
      `);

      // 插入預設管理員帳號
      db.get("SELECT id FROM users WHERE email = 'admin@company.com'", (err, row) => {
        if (!row) {
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          db.run(`
            INSERT INTO users (email, password, name, role) 
            VALUES (?, ?, ?, ?)
          `, ['admin@company.com', hashedPassword, '系統管理員', 'admin']);
          console.log('預設管理員帳號已建立: admin@company.com / admin123');
        }
      });

      // 插入預設系統設定
      db.run(`
        INSERT OR IGNORE INTO system_settings (key, value, description) VALUES 
        ('maintenance_mode', 'false', '系統維護模式'),
        ('max_images_per_product', '5', '每個商品最大圖片數量'),
        ('max_product_price', '999999', '商品最大價格'),
        ('allowed_categories', '電子產品,服飾,書籍,家具,其他', '允許的商品分類')
      `);

      // 建立索引
      db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      db.run('CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)');
      db.run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');

      db.run('PRAGMA foreign_keys = ON');
      
      console.log('資料庫表結構建立完成');
      resolve();
    });
  });
}

// 關閉資料庫連接
function closeDatabase() {
  db.close();
}

module.exports = {
  db,
  initDatabase,
  closeDatabase
};

#!/usr/bin/env node

/**
 * Railway SQLite 資料庫初始化腳本
 * 在 Railway Volume 中初始化 SQLite 資料庫
 */

const railwayVolume = require('../config/railway-volume');
const { getDatabaseConfig } = require('../config/env');

console.log('🚀 Railway SQLite 資料庫初始化開始...\n');

async function initRailwayDatabase() {
  try {
    const dbConfig = getDatabaseConfig();
    
    console.log('📊 資料庫配置:');
    console.log(`類型: ${dbConfig.type}`);
    console.log(`路徑: ${dbConfig.path}`);
    console.log(`上傳路徑: ${dbConfig.uploadPath}`);
    
    // 檢查是否在 Railway 環境
    if (dbConfig.type !== 'sqlite') {
      console.log('❌ 不是 SQLite 環境，跳過初始化');
      return;
    }
    
    // 確保目錄存在
    const path = require('path');
    const fs = require('fs');
    
    const dbDir = path.dirname(dbConfig.path);
    const uploadDir = dbConfig.uploadPath;
    
    console.log('\n📁 創建目錄結構...');
    
    // 創建資料庫目錄
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`✅ 創建資料庫目錄: ${dbDir}`);
    }
    
    // 創建上傳目錄
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`✅ 創建上傳目錄: ${uploadDir}`);
    }
    
    // 創建子目錄
    const subDirs = [
      path.join(uploadDir, 'avatars'),
      path.join(uploadDir, 'products')
    ];
    
    for (const subDir of subDirs) {
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
        console.log(`✅ 創建子目錄: ${subDir}`);
      }
    }
    
    console.log('\n🗄️ 初始化 SQLite 資料庫...');
    
    // 初始化 SQLite 資料庫
    const sqlite3 = require('sqlite3').verbose();
    
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbConfig.path, (err) => {
        if (err) {
          console.error('❌ 資料庫連接失敗:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ SQLite 資料庫連接成功');
        
        // 創建表
        db.serialize(() => {
          // users 表
          db.run(`
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
          
          // products 表
          db.run(`
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
          
          // system_settings 表
          db.run(`
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
          
          // maintenance 表
          db.run(`
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
          
          // 插入初始數據
          console.log('\n📝 插入初始數據...');
          
          // 插入維護模式設置
          db.run(`
            INSERT OR IGNORE INTO system_settings (setting_key, setting_value, setting_type, description, is_public) 
            VALUES (?, ?, ?, ?, ?)
          `, ['maintenance_mode', 'false', 'boolean', '系統維護模式', 1], (err) => {
            if (err) {
              console.log(`❌ 維護模式設置插入失敗: ${err.message}`);
            } else {
              console.log('✅ 維護模式設置插入成功');
            }
          });
          
          // 插入維護狀態
          db.run(`
            INSERT OR IGNORE INTO maintenance (enabled, message) 
            VALUES (?, ?)
          `, [0, '系統正常運行中'], (err) => {
            if (err) {
              console.log(`❌ 維護狀態插入失敗: ${err.message}`);
            } else {
              console.log('✅ 維護狀態插入成功');
            }
          });
          
          // 創建索引
          console.log('\n🔍 創建索引...');
          
          db.run('CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)', (err) => {
            if (err) console.log(`❌ 索引創建失敗: ${err.message}`);
            else console.log('✅ 商品用戶索引創建成功');
          });
          
          db.run('CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)', (err) => {
            if (err) console.log(`❌ 索引創建失敗: ${err.message}`);
            else console.log('✅ 商品狀態索引創建成功');
          });
          
          db.run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)', (err) => {
            if (err) console.log(`❌ 索引創建失敗: ${err.message}`);
            else console.log('✅ 商品分類索引創建成功');
          });
          
          db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
            if (err) console.log(`❌ 索引創建失敗: ${err.message}`);
            else console.log('✅ 用戶郵箱索引創建成功');
          });
          
          // 關閉資料庫連接
          db.close((err) => {
            if (err) {
              console.error('❌ 資料庫關閉失敗:', err.message);
              reject(err);
            } else {
              console.log('✅ SQLite 資料庫關閉成功');
              console.log('\n🎉 Railway SQLite 資料庫初始化完成！');
              resolve();
            }
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ 初始化失敗:', error);
    throw error;
  }
}

initRailwayDatabase()
  .then(() => {
    console.log('\n🚀 Railway SQLite 初始化完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 初始化失敗:', error);
    process.exit(1);
  });

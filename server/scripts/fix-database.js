#!/usr/bin/env node

/**
 * 数据库修复脚本
 * 用于检查和修复 Railway SQLite 数据库问题
 */

const railwayVolume = require('../config/railway-volume');
const { getDatabaseConfig } = require('../config/env');
const sqlite3 = require('sqlite3').verbose();

console.log('🔧 数据库修复脚本开始...\n');

async function fixDatabase() {
  try {
    const dbConfig = getDatabaseConfig();
    
    console.log('📊 数据库配置:');
    console.log(`类型: ${dbConfig.type}`);
    console.log(`路径: ${dbConfig.path}`);
    console.log(`上传路径: ${dbConfig.uploadPath}`);
    
    // 检查是否在 Railway 环境
    if (dbConfig.type !== 'sqlite') {
      console.log('❌ 不是 SQLite 环境，跳过修复');
      return;
    }
    
    // 确保目录存在
    const path = require('path');
    const fs = require('fs');
    
    const dbDir = path.dirname(dbConfig.path);
    const uploadDir = dbConfig.uploadPath;
    
    console.log('\n📁 检查目录结构...');
    
    // 创建数据库目录
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`✅ 创建数据库目录: ${dbDir}`);
    }
    
    // 创建上传目录
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`✅ 创建上传目录: ${uploadDir}`);
    }
    
    // 创建子目录
    const subDirs = [
      path.join(uploadDir, 'avatars'),
      path.join(uploadDir, 'products')
    ];
    
    for (const subDir of subDirs) {
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
        console.log(`✅ 创建子目录: ${subDir}`);
      }
    }
    
    console.log('\n🗄️ 检查数据库文件...');
    
    // 检查数据库文件是否存在
    if (!fs.existsSync(dbConfig.path)) {
      console.log(`⚠️  数据库文件不存在: ${dbConfig.path}`);
      console.log('将创建新的数据库文件...');
    } else {
      console.log(`✅ 数据库文件存在: ${dbConfig.path}`);
      
      // 检查文件大小
      const stats = fs.statSync(dbConfig.path);
      console.log(`📏 数据库文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
    }
    
    console.log('\n🔍 连接数据库并检查表结构...');
    
    // 连接数据库
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbConfig.path, (err) => {
        if (err) {
          console.error('❌ 数据库连接失败:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ SQLite 数据库连接成功');
        
        // 检查现有表
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
          if (err) {
            console.error('❌ 查询表失败:', err.message);
            reject(err);
            return;
          }
          
          console.log('\n📋 现有表:');
          if (tables.length === 0) {
            console.log('❌ 没有找到任何表');
          } else {
            tables.forEach(table => {
              console.log(`✅ ${table.name}`);
            });
          }
          
          // 如果表不存在，创建它们
          if (tables.length === 0 || !tables.find(t => t.name === 'users')) {
            console.log('\n🔨 创建缺失的表...');
            createTables(db);
          } else {
            console.log('\n✅ 所有必要的表都已存在');
            insertInitialData(db);
          }
        });
      });
    });
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  }
}

function createTables(db) {
  console.log('创建 users 表...');
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
      console.log(`❌ users 表创建失败: ${err.message}`);
    } else {
      console.log('✅ users 表创建成功');
    }
  });
  
  console.log('创建 products 表...');
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
      console.log(`❌ products 表创建失败: ${err.message}`);
    } else {
      console.log('✅ products 表创建成功');
    }
  });
  
  console.log('创建 system_settings 表...');
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
      console.log(`❌ system_settings 表创建失败: ${err.message}`);
    } else {
      console.log('✅ system_settings 表创建成功');
    }
  });
  
  console.log('创建 maintenance 表...');
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enabled INTEGER DEFAULT 0,
      message TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.log(`❌ maintenance 表创建失败: ${err.message}`);
    } else {
      console.log('✅ maintenance 表创建成功');
    }
  });
  
  // 等待表创建完成后插入初始数据
  setTimeout(() => {
    insertInitialData(db);
  }, 1000);
}

function insertInitialData(db) {
  console.log('\n📝 插入初始数据...');
  
  // 插入维护模式设置
  db.run(`
    INSERT OR IGNORE INTO system_settings (setting_key, setting_value, setting_type, description, is_public) 
    VALUES (?, ?, ?, ?, ?)
  `, ['maintenance_mode', 'false', 'boolean', '系统维护模式', 1], (err) => {
    if (err) {
      console.log(`❌ 维护模式设置插入失败: ${err.message}`);
    } else {
      console.log('✅ 维护模式设置插入成功');
    }
  });
  
  // 插入维护状态
  db.run(`
    INSERT OR IGNORE INTO maintenance (enabled, message) 
    VALUES (?, ?)
  `, [0, '系统正常运行中'], (err) => {
    if (err) {
      console.log(`❌ 维护状态插入失败: ${err.message}`);
    } else {
      console.log('✅ 维护状态插入成功');
    }
  });
  
  // 创建索引
  console.log('\n🔍 创建索引...');
  
  db.run('CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)', (err) => {
    if (err) console.log(`❌ 索引创建失败: ${err.message}`);
    else console.log('✅ 商品用户索引创建成功');
  });
  
  db.run('CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)', (err) => {
    if (err) console.log(`❌ 索引创建失败: ${err.message}`);
    else console.log('✅ 商品状态索引创建成功');
  });
  
  db.run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)', (err) => {
    if (err) console.log(`❌ 索引创建失败: ${err.message}`);
    else console.log('✅ 商品分类索引创建成功');
  });
  
  db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
    if (err) console.log(`❌ 索引创建失败: ${err.message}`);
    else console.log('✅ 用户邮箱索引创建成功');
  });
  
  // 关闭数据库连接
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('❌ 数据库关闭失败:', err.message);
      } else {
        console.log('✅ SQLite 数据库关闭成功');
        console.log('\n🎉 数据库修复完成！');
      }
    });
  }, 1000);
}

fixDatabase()
  .then(() => {
    console.log('\n🚀 数据库修复完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  });

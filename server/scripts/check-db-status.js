#!/usr/bin/env node

/**
 * 数据库状态检查脚本
 * 快速检查 Railway SQLite 数据库状态
 */

const railwayVolume = require('../config/railway-volume');
const { getDatabaseConfig } = require('../config/env');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🔍 数据库状态检查开始...\n');

async function checkDatabaseStatus() {
  try {
    const dbConfig = getDatabaseConfig();
    
    console.log('📊 数据库配置:');
    console.log(`类型: ${dbConfig.type}`);
    console.log(`路径: ${dbConfig.path}`);
    console.log(`上传路径: ${dbConfig.uploadPath}`);
    
    // 检查是否在 Railway 环境
    if (dbConfig.type !== 'sqlite') {
      console.log('❌ 不是 SQLite 环境');
      return;
    }
    
    console.log('\n📁 目录检查:');
    
    // 检查数据库目录
    const dbDir = path.dirname(dbConfig.path);
    if (fs.existsSync(dbDir)) {
      console.log(`✅ 数据库目录存在: ${dbDir}`);
    } else {
      console.log(`❌ 数据库目录不存在: ${dbDir}`);
    }
    
    // 检查数据库文件
    if (fs.existsSync(dbConfig.path)) {
      const stats = fs.statSync(dbConfig.path);
      console.log(`✅ 数据库文件存在: ${dbConfig.path}`);
      console.log(`📏 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log(`❌ 数据库文件不存在: ${dbConfig.path}`);
    }
    
    // 检查上传目录
    if (fs.existsSync(dbConfig.uploadPath)) {
      console.log(`✅ 上传目录存在: ${dbConfig.uploadPath}`);
    } else {
      console.log(`❌ 上传目录不存在: ${dbConfig.uploadPath}`);
    }
    
    console.log('\n🗄️ 数据库连接测试:');
    
    // 尝试连接数据库
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbConfig.path, (err) => {
        if (err) {
          console.error('❌ 数据库连接失败:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ 数据库连接成功');
        
        // 检查表结构
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
          if (err) {
            console.error('❌ 查询表失败:', err.message);
            reject(err);
            return;
          }
          
          console.log('\n📋 数据库表:');
          if (tables.length === 0) {
            console.log('❌ 没有找到任何表');
          } else {
            tables.forEach(table => {
              console.log(`✅ ${table.name}`);
            });
          }
          
          // 检查关键表
          const requiredTables = ['users', 'system_settings', 'products', 'maintenance'];
          const missingTables = requiredTables.filter(table => 
            !tables.find(t => t.name === table)
          );
          
          if (missingTables.length > 0) {
            console.log(`\n⚠️  缺失的表: ${missingTables.join(', ')}`);
          } else {
            console.log('\n✅ 所有必要的表都存在');
          }
          
          // 关闭数据库连接
          db.close((err) => {
            if (err) {
              console.error('❌ 数据库关闭失败:', err.message);
            } else {
              console.log('✅ 数据库连接已关闭');
            }
            resolve();
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
    throw error;
  }
}

checkDatabaseStatus()
  .then(() => {
    console.log('\n🔍 数据库状态检查完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  });

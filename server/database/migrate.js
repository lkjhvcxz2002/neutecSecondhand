const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 迁移数据库结构
async function migrateDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('开始数据库迁移...');
      
      // 检查 trade_type 字段是否已存在
      db.get("PRAGMA table_info(products)", (err, rows) => {
        if (err) {
          console.error('检查表结构时出错:', err);
          reject(err);
          return;
        }
        
        // 检查字段是否存在
        db.all("PRAGMA table_info(products)", (err, columns) => {
          if (err) {
            console.error('获取表结构时出错:', err);
            reject(err);
            return;
          }
          
          const hasTradeType = columns.some(col => col.name === 'trade_type');
          
          if (!hasTradeType) {
            console.log('添加 trade_type 字段到 products 表...');
            
            // 添加 trade_type 字段
            db.run(`
              ALTER TABLE products 
              ADD COLUMN trade_type TEXT DEFAULT 'sale'
            `, (err) => {
              if (err) {
                console.error('添加 trade_type 字段失败:', err);
                reject(err);
                return;
              }
              
              console.log('✅ trade_type 字段添加成功');
              
              // 更新现有数据的 trade_type 字段
              db.run(`
                UPDATE products 
                SET trade_type = 'sale' 
                WHERE trade_type IS NULL OR trade_type = ''
              `, (err) => {
                if (err) {
                  console.error('更新现有数据失败:', err);
                  reject(err);
                  return;
                }
                
                console.log('✅ 现有数据已更新');
                resolve();
              });
            });
          } else {
            console.log('✅ trade_type 字段已存在，无需迁移');
            resolve();
          }
        });
      });
    });
  });
}

// 关闭数据库连接
function closeDatabase() {
  db.close();
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('数据库迁移完成');
      closeDatabase();
    })
    .catch((err) => {
      console.error('数据库迁移失败:', err);
      closeDatabase();
      process.exit(1);
    });
}

module.exports = {
  migrateDatabase,
  closeDatabase
};

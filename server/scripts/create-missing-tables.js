const railwayDb = require('../config/railway-db');

async function createMissingTables() {
  console.log('🔧 開始創建缺失的資料表...');
  
  try {
    // 等待資料庫初始化
    let attempts = 0;
    while (!railwayDb.isConnected() && attempts < 50) {
      console.log(`⏳ 等待資料庫連接... (${attempts + 1}/50)`);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!railwayDb.isConnected()) {
      console.error('❌ 資料庫連接超時');
      return;
    }
    
    console.log('✅ 資料庫已連接');
    
    // 先嘗試釋放資料庫鎖定
    console.log('\n🔓 嘗試釋放資料庫鎖定...');
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('釋放鎖定超時'));
        }, 10000);
        
        railwayDb.run('PRAGMA busy_timeout = 30000', (err) => {
          clearTimeout(timeout);
          if (err) {
            console.error('❌ 設置 busy_timeout 失敗:', err.message);
          } else {
            console.log('✅ 設置 busy_timeout 成功');
          }
          resolve();
        });
      });
    } catch (error) {
      console.error('❌ 釋放鎖定失敗:', error.message);
    }
    
    // 創建缺失的表
    const tables = [
      {
        name: 'password_reset_tokens',
        sql: `
          CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            token TEXT NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'email_verification_tokens',
        sql: `
          CREATE TABLE IF NOT EXISTS email_verification_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            token TEXT NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `
      }
    ];
    
    for (const table of tables) {
      console.log(`\n📋 創建表: ${table.name}`);
      
      // 重試機制
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;
      
      while (retryCount < maxRetries && !success) {
        try {
          if (retryCount > 0) {
            console.log(`🔄 第 ${retryCount + 1} 次重試...`);
            // 等待一段時間再重試
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`創建表 ${table.name} 超時`));
            }, 30000); // 增加到 30 秒
            
            railwayDb.run(table.sql, (err) => {
              clearTimeout(timeout);
              if (err) {
                if (err.message.includes('already exists')) {
                  console.log(`✅ 表 ${table.name} 已存在`);
                  success = true;
                } else {
                  console.error(`❌ 創建表 ${table.name} 失敗:`, err.message);
                  reject(err);
                }
              } else {
                console.log(`✅ 表 ${table.name} 創建成功`);
                success = true;
              }
              resolve();
            });
          });
          
        } catch (error) {
          retryCount++;
          console.error(`❌ 第 ${retryCount} 次嘗試失敗:`, error.message);
          
          if (retryCount >= maxRetries) {
            console.error(`❌ 創建表 ${table.name} 最終失敗，已重試 ${maxRetries} 次`);
          }
        }
      }
    }
    
    // 創建索引
    console.log('\n🔨 創建索引...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email)',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token)',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at)',
      'CREATE INDEX IF NOT EXISTS idx_email_verification_email ON email_verification_tokens(email)',
      'CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token)',
      'CREATE INDEX IF NOT EXISTS idx_email_verification_expires ON email_verification_tokens(expires_at)'
    ];
    
    for (const index of indexes) {
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`創建索引超時`));
          }, 15000); // 15 秒超時
          
          railwayDb.run(index, (err) => {
            clearTimeout(timeout);
            if (err) {
              if (err.message.includes('already exists')) {
                console.log(`✅ 索引已存在`);
              } else {
                console.error(`❌ 創建索引失敗:`, err.message);
              }
            } else {
              console.log(`✅ 索引創建成功`);
            }
            resolve();
          });
        });
      } catch (error) {
        console.error(`❌ 創建索引失敗:`, error.message);
      }
    }
    
    // 驗證表是否創建成功
    console.log('\n🔍 驗證表創建...');
    const tableNames = ['password_reset_tokens', 'email_verification_tokens'];
    
    for (const tableName of tableNames) {
      try {
        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`驗證表 ${tableName} 超時`));
          }, 10000);
          
          railwayDb.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, result) => {
            clearTimeout(timeout);
            if (err) reject(err);
            else resolve(result);
          });
        });
        
        if (result) {
          console.log(`✅ 表 ${tableName} 驗證成功`);
          
          // 檢查表結構
          const columns = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`檢查表結構超時`));
            }, 10000);
            
            railwayDb.all(`PRAGMA table_info(${tableName})`, (err, result) => {
              clearTimeout(timeout);
              if (err) reject(err);
              else resolve(result);
            });
          });
          
          console.log(`📊 表 ${tableName} 的欄位:`);
          columns.forEach(col => {
            console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
          });
          
        } else {
          console.log(`❌ 表 ${tableName} 驗證失敗`);
        }
        
      } catch (error) {
        console.error(`❌ 驗證表 ${tableName} 失敗:`, error.message);
      }
    }
    
    console.log('\n🎉 缺失表創建完成！');
    
  } catch (error) {
    console.error('❌ 創建失敗:', error);
  } finally {
    // 關閉資料庫連接
    railwayDb.close();
    console.log('🔒 資料庫連接已關閉');
  }
}

// 執行創建
createMissingTables();

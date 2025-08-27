const railwayDb = require('../config/railway-db');

async function fixDatabaseLocks() {
  console.log('🔧 開始修復資料庫鎖定問題...');
  
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
    
    // 1. 檢查並修復資料庫完整性
    console.log('\n🔍 檢查資料庫完整性...');
    try {
      const integrity = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('完整性檢查超時'));
        }, 10000);
        
        railwayDb.get('PRAGMA integrity_check', (err, result) => {
          clearTimeout(timeout);
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      if (integrity.integrity_check === 'ok') {
        console.log('✅ 資料庫完整性檢查通過');
      } else {
        console.log('⚠️ 資料庫完整性檢查結果:', integrity.integrity_check);
      }
    } catch (error) {
      console.error('❌ 完整性檢查失敗:', error.message);
    }
    
    // 2. 優化資料庫設定
    console.log('\n⚙️ 優化資料庫設定...');
    const pragmas = [
      'PRAGMA journal_mode = WAL',
      'PRAGMA synchronous = NORMAL',
      'PRAGMA cache_size = 10000',
      'PRAGMA temp_store = MEMORY',
      'PRAGMA mmap_size = 268435456',
      'PRAGMA page_size = 4096'
    ];
    
    for (const pragma of pragmas) {
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`${pragma} 執行超時`));
          }, 5000);
          
          railwayDb.run(pragma, (err) => {
            clearTimeout(timeout);
            if (err) {
              console.error(`❌ ${pragma} 失敗:`, err.message);
            } else {
              console.log(`✅ ${pragma} 執行成功`);
            }
            resolve();
          });
        });
      } catch (error) {
        console.error(`❌ ${pragma} 執行失敗:`, error.message);
      }
    }
    
    // 3. 重建索引
    console.log('\n🔨 重建索引...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)',
      'CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
      'CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at)'
    ];
    
    for (const index of indexes) {
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`${index} 執行超時`));
          }, 5000);
          
          railwayDb.run(index, (err) => {
            clearTimeout(timeout);
            if (err) {
              console.error(`❌ ${index} 失敗:`, err.message);
            } else {
              console.log(`✅ ${index} 執行成功`);
            }
            resolve();
          });
        });
      } catch (error) {
        console.error(`❌ ${index} 執行失敗:`, error.message);
      }
    }
    
    // 4. 分析表統計
    console.log('\n📊 分析表統計...');
    const tables = ['users', 'products', 'system_settings'];
    
    for (const table of tables) {
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`分析表 ${table} 超時`));
          }, 5000);
          
          railwayDb.run(`ANALYZE ${table}`, (err) => {
            clearTimeout(timeout);
            if (err) {
              console.error(`❌ 分析表 ${table} 失敗:`, err.message);
            } else {
              console.log(`✅ 分析表 ${table} 成功`);
            }
            resolve();
          });
        });
      } catch (error) {
        console.error(`❌ 分析表 ${table} 失敗:`, error.message);
      }
    }
    
    // 5. 測試簡單查詢
    console.log('\n🧪 測試簡單查詢...');
    try {
      const testQuery = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('測試查詢超時'));
        }, 5000);
        
        railwayDb.get('SELECT COUNT(*) as count FROM users', (err, result) => {
          clearTimeout(timeout);
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log('✅ 測試查詢成功:', testQuery);
      
    } catch (error) {
      console.error('❌ 測試查詢失敗:', error.message);
    }
    
    console.log('\n🎉 資料庫修復完成！');
    
  } catch (error) {
    console.error('❌ 修復失敗:', error);
  } finally {
    // 關閉資料庫連接
    railwayDb.close();
    console.log('🔒 資料庫連接已關閉');
  }
}

// 執行修復
fixDatabaseLocks();

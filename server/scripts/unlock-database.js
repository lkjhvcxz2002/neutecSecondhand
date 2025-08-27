const railwayDb = require('../config/railway-db');

async function unlockDatabase() {
  console.log('🔓 開始檢查和釋放資料庫鎖定...');
  
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
    
    // 1. 檢查資料庫狀態
    console.log('\n🔍 檢查資料庫狀態...');
    
    const pragmas = [
      'PRAGMA database_list',
      'PRAGMA journal_mode',
      'PRAGMA synchronous',
      'PRAGMA busy_timeout',
      'PRAGMA temp_store',
      'PRAGMA cache_size'
    ];
    
    for (const pragma of pragmas) {
      try {
        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`${pragma} 執行超時`));
          }, 5000);
          
          railwayDb.get(pragma, (err, result) => {
            clearTimeout(timeout);
            if (err) reject(err);
            else resolve(result);
          });
        });
        
        console.log(`✅ ${pragma}:`, JSON.stringify(result));
        
      } catch (error) {
        console.error(`❌ ${pragma} 失敗:`, error.message);
      }
    }
    
    // 2. 嘗試釋放鎖定
    console.log('\n🔓 嘗試釋放資料庫鎖定...');
    
    const unlockCommands = [
      'PRAGMA optimize',
      'PRAGMA wal_checkpoint(TRUNCATE)',
      'PRAGMA temp_store = MEMORY',
      'PRAGMA cache_size = 10000',
      'PRAGMA busy_timeout = 30000'
    ];
    
    for (const command of unlockCommands) {
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`${command} 執行超時`));
          }, 5000);
          
          railwayDb.run(command, (err) => {
            clearTimeout(timeout);
            if (err) {
              console.error(`❌ ${command} 失敗:`, err.message);
            } else {
              console.log(`✅ ${command} 執行成功`);
            }
            resolve();
          });
        });
      } catch (error) {
        console.error(`❌ ${command} 執行失敗:`, error.message);
      }
    }
    
    // 3. 測試簡單查詢
    console.log('\n🧪 測試簡單查詢...');
    
    try {
      const testResult = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('測試查詢超時'));
        }, 5000);
        
        railwayDb.get('SELECT 1 as test', (err, result) => {
          clearTimeout(timeout);
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log('✅ 測試查詢成功:', testResult);
      
    } catch (error) {
      console.error('❌ 測試查詢失敗:', error.message);
    }
    
    // 4. 檢查是否有長時間運行的查詢
    console.log('\n🔍 檢查資料庫進程...');
    
    try {
      const processes = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('檢查進程超時'));
        }, 5000);
        
        railwayDb.all("SELECT * FROM sqlite_master WHERE type='table'", (err, result) => {
          clearTimeout(timeout);
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log('✅ 資料庫表檢查成功，找到', processes.length, '個表');
      
    } catch (error) {
      console.error('❌ 檢查資料庫進程失敗:', error.message);
    }
    
    console.log('\n🎉 資料庫鎖定檢查完成！');
    
  } catch (error) {
    console.error('❌ 解鎖失敗:', error);
  } finally {
    // 關閉資料庫連接
    railwayDb.close();
    console.log('🔒 資料庫連接已關閉');
  }
}

// 執行解鎖
unlockDatabase();

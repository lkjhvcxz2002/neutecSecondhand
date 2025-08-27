const railwayDb = require('../config/railway-db');

async function checkDatabaseTables() {
  console.log('🔍 檢查資料庫表結構...');
  
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
    
    // 檢查所有表
    const tables = ['users', 'products', 'system_settings', 'maintenance', 'admin_logs'];
    
    for (const table of tables) {
      console.log(`\n📋 檢查表: ${table}`);
      
      try {
        const result = await new Promise((resolve, reject) => {
          railwayDb.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        
        if (result) {
          console.log(`✅ 表 ${table} 存在`);
          
          // 檢查表結構
          const columns = await new Promise((resolve, reject) => {
            railwayDb.all(`PRAGMA table_info(${table})`, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
          
          console.log(`📊 表 ${table} 的欄位:`);
          columns.forEach(col => {
            console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
          });
          
          // 檢查記錄數量
          const count = await new Promise((resolve, reject) => {
            railwayDb.get(`SELECT COUNT(*) as count FROM ${table}`, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
          
          console.log(`📈 表 ${table} 記錄數量: ${count.count}`);
          
        } else {
          console.log(`❌ 表 ${table} 不存在`);
        }
        
      } catch (error) {
        console.error(`❌ 檢查表 ${table} 失敗:`, error.message);
      }
    }
    
    // 檢查資料庫設定
    console.log('\n⚙️ 檢查資料庫設定...');
    
    const pragmas = [
      'foreign_keys',
      'journal_mode',
      'synchronous',
      'temp_store',
      'cache_size'
    ];
    
    for (const pragma of pragmas) {
      try {
        const result = await new Promise((resolve, reject) => {
          railwayDb.get(`PRAGMA ${pragma}`, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        
        console.log(`✅ PRAGMA ${pragma}: ${JSON.stringify(result)}`);
        
      } catch (error) {
        console.error(`❌ 檢查 PRAGMA ${pragma} 失敗:`, error.message);
      }
    }
    
    console.log('\n🎉 資料庫檢查完成！');
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    // 關閉資料庫連接
    railwayDb.close();
    console.log('🔒 資料庫連接已關閉');
  }
}

// 執行檢查
checkDatabaseTables();

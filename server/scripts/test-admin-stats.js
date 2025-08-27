const railwayDb = require('../config/railway-db');

async function testDatabaseQueries() {
  console.log('🧪 開始測試資料庫查詢...');
  
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
    
    // 測試用戶統計查詢
    console.log('\n📊 測試用戶統計查詢...');
    const userStats = await new Promise((resolve, reject) => {
      railwayDb.get('SELECT COUNT(*) as total_users FROM users', (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    console.log('✅ 用戶統計查詢成功:', userStats);
    
    // 測試商品統計查詢
    console.log('\n📊 測試商品統計查詢...');
    const productStats = await new Promise((resolve, reject) => {
      railwayDb.get('SELECT COUNT(*) as total_products FROM products', (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    console.log('✅ 商品統計查詢成功:', productStats);
    
    // 測試活躍商品統計查詢
    console.log('\n📊 測試活躍商品統計查詢...');
    const activeStats = await new Promise((resolve, reject) => {
      railwayDb.get('SELECT COUNT(*) as active_products FROM products WHERE status = "active"', (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    console.log('✅ 活躍商品統計查詢成功:', activeStats);
    
    // 測試分類統計查詢
    console.log('\n📊 測試分類統計查詢...');
    const categoryStats = await new Promise((resolve, reject) => {
      railwayDb.all('SELECT category, COUNT(*) as count FROM products GROUP BY category', (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    console.log('✅ 分類統計查詢成功:', categoryStats);
    
    // 測試並行查詢
    console.log('\n🚀 測試並行查詢...');
    const [userStats2, productStats2, activeStats2, categoryStats2] = await Promise.all([
      new Promise((resolve, reject) => {
        railwayDb.get('SELECT COUNT(*) as total_users FROM users', (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      }),
      new Promise((resolve, reject) => {
        railwayDb.get('SELECT COUNT(*) as total_products FROM products', (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      }),
      new Promise((resolve, reject) => {
        railwayDb.get('SELECT COUNT(*) as active_products FROM products WHERE status = "active"', (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      }),
      new Promise((resolve, reject) => {
        railwayDb.all('SELECT category, COUNT(*) as count FROM products GROUP BY category', (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      })
    ]);
    
    console.log('✅ 並行查詢成功:', {
      users: userStats2.total_users,
      products: productStats2.total_products,
      active: activeStats2.active_products,
      categories: categoryStats2.length
    });
    
    console.log('\n🎉 所有測試通過！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    // 關閉資料庫連接
    railwayDb.close();
    console.log('🔒 資料庫連接已關閉');
  }
}

// 執行測試
testDatabaseQueries();

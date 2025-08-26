#!/usr/bin/env node

/**
 * 測試用戶註冊功能
 * 驗證資料庫欄位匹配問題是否已修復
 */

const railwayDb = require('../config/railway-db');
const bcrypt = require('bcryptjs');

console.log('🧪 開始測試用戶註冊功能...\n');

async function testRegistration() {
  try {
    console.log('📊 檢查 users 表結構...');
    
    // 檢查 users 表的欄位
    const tableInfo = await railwayDb.all("PRAGMA table_info(users)");
    
    if (tableInfo.length === 0) {
      console.log('❌ users 表不存在');
      return;
    }
    
    console.log('✅ users 表存在，欄位如下：');
    tableInfo.forEach(column => {
      const notNull = column.notnull ? 'NOT NULL' : 'NULL';
      const defaultValue = column.dflt_value ? `DEFAULT ${column.dflt_value}` : '';
      console.log(`  - ${column.name} (${column.type}) ${notNull} ${defaultValue}`);
    });
    
    console.log('\n🔍 檢查必填欄位...');
    const requiredFields = tableInfo.filter(col => col.notnull === 1).map(col => col.name);
    console.log(`必填欄位: ${requiredFields.join(', ')}`);
    
    console.log('\n🧪 測試插入用戶資料...');
    
    // 測試資料
    const testUser = {
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password_hash: await bcrypt.hash('testpassword123', 10),
      name: '測試用戶',
      telegram: '@testuser'
    };
    
    console.log('測試資料:', {
      username: testUser.username,
      email: testUser.email,
      name: testUser.name,
      telegram: testUser.telegram
    });
    
    // 嘗試插入
    const result = await railwayDb.run(
      'INSERT INTO users (username, email, password_hash, name, telegram) VALUES (?, ?, ?, ?, ?)',
      [testUser.username, testUser.email, testUser.password_hash, testUser.name, testUser.telegram]
    );
    
    console.log('✅ 用戶插入成功，ID:', result.lastID);
    
    // 驗證插入的資料
    const insertedUser = await railwayDb.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    console.log('✅ 插入的用戶資料:', {
      id: insertedUser.id,
      username: insertedUser.username,
      email: insertedUser.email,
      name: insertedUser.name,
      telegram: insertedUser.telegram,
      status: insertedUser.status,
      role: insertedUser.role
    });
    
    // 清理測試資料
    await railwayDb.run('DELETE FROM users WHERE id = ?', [result.lastID]);
    console.log('🧹 測試資料已清理');
    
    console.log('\n🎉 用戶註冊功能測試通過！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    
    if (error.code === 'SQLITE_CONSTRAINT') {
      console.log('\n🔍 約束錯誤分析:');
      console.log('- 可能是 NOT NULL 約束失敗');
      console.log('- 可能是 UNIQUE 約束失敗');
      console.log('- 請檢查欄位名稱和數量是否匹配');
    }
  }
}

testRegistration()
  .then(() => {
    console.log('\n✅ 測試完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 測試失敗:', error);
    process.exit(1);
  });

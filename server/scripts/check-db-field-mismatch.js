#!/usr/bin/env node

/**
 * 檢查資料庫欄位與路由使用情況的匹配度
 * 識別可能的欄位數量不匹配問題
 */

const railwayDb = require('../config/railway-db');
const fs = require('fs');
const path = require('path');

console.log('🔍 開始檢查資料庫欄位與路由使用情況的匹配度...\n');

// 檢查是否在 Railway 環境
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || 
                  process.env.RAILWAY_PROJECT_ID || 
                  process.env.RAILWAY_SERVICE_NAME;

console.log(`🌍 環境檢測: ${isRailway ? 'Railway 生產環境' : '本地開發環境'}`);
console.log(`🗄️ 資料庫路徑: ${railwayDb.getDatabasePath()}\n`);

// 定義所有表的預期結構
const expectedTableStructure = {
  users: {
    fields: ['id', 'username', 'email', 'password_hash', 'name', 'avatar', 'telegram', 'status', 'role', 'created_at', 'updated_at'],
    requiredFields: ['username', 'email', 'password_hash'],
    description: '用戶表'
  },
  products: {
    fields: ['id', 'user_id', 'title', 'description', 'price', 'category', 'trade_type', 'status', 'images', 'created_at', 'updated_at'],
    requiredFields: ['user_id', 'title', 'category', 'trade_type'],
    description: '商品表'
  },
  product_images: {
    fields: ['id', 'product_id', 'image_path', 'created_at'],
    requiredFields: ['product_id', 'image_path'],
    description: '商品圖片表'
  },
  system_settings: {
    fields: ['id', 'setting_key', 'setting_value', 'setting_type', 'description', 'is_public', 'created_at', 'updated_at'],
    requiredFields: ['setting_key'],
    description: '系統設定表'
  },
  maintenance: {
    fields: ['id', 'enabled', 'message', 'updated_at'],
    requiredFields: [],
    description: '維護模式表'
  },
  admin_logs: {
    fields: ['id', 'admin_id', 'action', 'details', 'ip_address', 'created_at'],
    requiredFields: ['admin_id', 'action'],
    description: '管理員操作日誌表'
  }
};

async function checkDatabaseStructure() {
  try {
    console.log('📊 檢查資料庫表結構...\n');
    
    const results = {};
    
    for (const [tableName, expected] of Object.entries(expectedTableStructure)) {
      console.log(`🔍 檢查 ${tableName} 表 (${expected.description})...`);
      
      try {
        // 獲取表的實際結構
        const tableInfo = await railwayDb.all(`PRAGMA table_info(${tableName})`);
        
        if (tableInfo.length === 0) {
          console.log(`  ❌ 表 ${tableName} 不存在`);
          results[tableName] = { exists: false, issues: ['表不存在'] };
          continue;
        }
        
        const actualFields = tableInfo.map(col => col.name);
        const actualRequiredFields = tableInfo.filter(col => col.notnull === 1).map(col => col.name);
        
        console.log(`  ✅ 表存在，實際欄位: ${actualFields.length} 個`);
        console.log(`  📋 欄位列表: ${actualFields.join(', ')}`);
        console.log(`  🔒 必填欄位: ${actualRequiredFields.join(', ')}`);
        
        // 檢查欄位數量
        const fieldCountMatch = actualFields.length === expected.fields.length;
        const fieldMatch = actualFields.every(field => expected.fields.includes(field));
        
        // 檢查必填欄位
        const requiredFieldMatch = expected.requiredFields.every(field => actualRequiredFields.includes(field));
        
        const issues = [];
        if (!fieldCountMatch) {
          issues.push(`欄位數量不匹配: 預期 ${expected.fields.length} 個，實際 ${actualFields.length} 個`);
        }
        if (!fieldMatch) {
          const missingFields = expected.fields.filter(field => !actualFields.includes(field));
          const extraFields = actualFields.filter(field => !expected.fields.includes(field));
          if (missingFields.length > 0) {
            issues.push(`缺少欄位: ${missingFields.join(', ')}`);
          }
          if (extraFields.length > 0) {
            issues.push(`多餘欄位: ${extraFields.join(', ')}`);
          }
        }
        if (!requiredFieldMatch) {
          const missingRequired = expected.requiredFields.filter(field => !actualRequiredFields.includes(field));
          if (missingRequired.length > 0) {
            issues.push(`缺少必填欄位: ${missingRequired.join(', ')}`);
          }
        }
        
        results[tableName] = {
          exists: true,
          expectedFields: expected.fields.length,
          actualFields: actualFields.length,
          fieldCountMatch,
          fieldMatch,
          requiredFieldMatch,
          issues,
          actualFields,
          actualRequiredFields
        };
        
        if (issues.length === 0) {
          console.log(`  ✅ 表結構完全匹配`);
        } else {
          console.log(`  ⚠️  發現問題:`);
          issues.forEach(issue => console.log(`    - ${issue}`));
        }
        
      } catch (error) {
        console.log(`  ❌ 檢查失敗: ${error.message}`);
        results[tableName] = { exists: false, issues: [`檢查失敗: ${error.message}`] };
      }
      
      console.log('');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ 檢查資料庫結構失敗:', error);
    throw error;
  }
}

async function checkRouteUsage() {
  console.log('🔍 檢查路由使用情況...\n');
  
  const routeFiles = [
    'server/routes/auth.js',
    'server/routes/products.js',
    'server/routes/admin.js',
    'server/routes/maintenance.js'
  ];
  
  const routeIssues = [];
  
  for (const routeFile of routeFiles) {
    if (fs.existsSync(routeFile)) {
      console.log(`📁 檢查 ${routeFile}...`);
      
      try {
        const content = fs.readFileSync(routeFile, 'utf8');
        
        // 檢查 INSERT 語句
        const insertMatches = content.match(/INSERT INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/g);
        if (insertMatches) {
          insertMatches.forEach(match => {
            const tableMatch = match.match(/INSERT INTO (\w+)/);
            const fieldsMatch = match.match(/\(([^)]+)\)/);
            if (tableMatch && fieldsMatch) {
              const tableName = tableMatch[1];
              const fields = fieldsMatch[1].split(',').map(f => f.trim());
              console.log(`  📝 INSERT ${tableName}: ${fields.length} 個欄位`);
              
              // 檢查欄位數量是否與表結構匹配
              if (expectedTableStructure[tableName]) {
                const expectedFields = expectedTableStructure[tableName].fields.length - 1; // 減去 id
                if (fields.length !== expectedFields) {
                  routeIssues.push({
                    file: routeFile,
                    table: tableName,
                    type: 'INSERT',
                    issue: `欄位數量不匹配: 預期 ${expectedFields} 個，實際 ${fields.length} 個`,
                    fields: fields
                  });
                }
              }
            }
          });
        }
        
        // 檢查 UPDATE 語句
        const updateMatches = content.match(/UPDATE (\w+)\s+SET\s+([^WHERE]+)/g);
        if (updateMatches) {
          updateMatches.forEach(match => {
            const tableMatch = match.match(/UPDATE (\w+)/);
            if (tableMatch) {
              const tableName = tableMatch[1];
              console.log(`  🔄 UPDATE ${tableName}: 動態欄位更新`);
            }
          });
        }
        
      } catch (error) {
        console.log(`  ❌ 讀取失敗: ${error.message}`);
      }
    }
  }
  
  return routeIssues;
}

async function generateReport(dbResults, routeIssues) {
  console.log('\n📋 生成檢查報告...\n');
  
  console.log('🎯 資料庫表結構檢查結果:');
  console.log('========================');
  
  let totalIssues = 0;
  
  for (const [tableName, result] of Object.entries(dbResults)) {
    if (result.issues && result.issues.length > 0) {
      console.log(`\n❌ ${tableName} 表有問題:`);
      result.issues.forEach(issue => {
        console.log(`  - ${issue}`);
        totalIssues++;
      });
    } else if (result.exists) {
      console.log(`\n✅ ${tableName} 表正常`);
    }
  }
  
  if (routeIssues.length > 0) {
    console.log('\n⚠️  路由使用問題:');
    console.log('================');
    
    routeIssues.forEach(issue => {
      console.log(`\n📁 ${issue.file}`);
      console.log(`  表: ${issue.table}`);
      console.log(`  類型: ${issue.type}`);
      console.log(`  問題: ${issue.issue}`);
      console.log(`  欄位: ${issue.fields.join(', ')}`);
      totalIssues++;
    });
  }
  
  console.log('\n📊 總結:');
  console.log('========');
  console.log(`總問題數: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('🎉 所有表結構和路由使用都正常！');
  } else {
    console.log('🔧 建議修復發現的問題');
  }
  
  return totalIssues;
}

async function main() {
  try {
    const dbResults = await checkDatabaseStructure();
    const routeIssues = await checkRouteUsage();
    const totalIssues = await generateReport(dbResults, routeIssues);
    
    console.log('\n✅ 檢查完成！');
    process.exit(totalIssues === 0 ? 0 : 1);
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
    process.exit(1);
  }
}

main();

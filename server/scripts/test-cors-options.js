#!/usr/bin/env node

/**
 * 測試 CORS OPTIONS 請求處理
 * 驗證管理員路由的預檢請求是否正常工作
 */

const http = require('http');

console.log('🧪 開始測試 CORS OPTIONS 請求處理...\n');

// 測試配置
const testConfig = {
  host: 'localhost',
  port: 3000,
  path: '/api/admin/stats',
  method: 'OPTIONS'
};

// 測試 OPTIONS 請求
function testOptionsRequest() {
  return new Promise((resolve, reject) => {
    console.log(`📡 發送 OPTIONS 請求到: ${testConfig.host}:${testConfig.port}${testConfig.path}`);
    
    const options = {
      hostname: testConfig.host,
      port: testConfig.port,
      path: testConfig.path,
      method: testConfig.method,
      headers: {
        'Origin': 'https://neutecsecondhand.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`📊 回應狀態碼: ${res.statusCode}`);
      console.log(`📋 回應標頭:`);
      
      // 檢查 CORS 標頭
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-allow-credentials'
      ];
      
      corsHeaders.forEach(header => {
        if (res.headers[header]) {
          console.log(`  ✅ ${header}: ${res.headers[header]}`);
        } else {
          console.log(`  ❌ ${header}: 未設定`);
        }
      });

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ OPTIONS 請求成功處理');
          resolve({ statusCode: res.statusCode, headers: res.headers });
        } else {
          console.log('❌ OPTIONS 請求處理失敗');
          reject(new Error(`狀態碼: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ 請求錯誤:', err.message);
      reject(err);
    });

    req.end();
  });
}

// 測試 GET 請求（需要認證）
function testGetRequest() {
  return new Promise((resolve, reject) => {
    console.log(`\n📡 發送 GET 請求到: ${testConfig.host}:${testConfig.port}${testConfig.path}`);
    
    const options = {
      hostname: testConfig.host,
      port: testConfig.port,
      path: testConfig.path,
      method: 'GET',
      headers: {
        'Origin': 'https://neutecsecondhand.vercel.app',
        'Content-Type': 'application/json'
        // 注意：沒有 Authorization 標頭，應該會失敗
      }
    };

    const req = http.request(options, (res) => {
      console.log(`📊 回應狀態碼: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 401) {
          console.log('✅ GET 請求正確被拒絕（缺少認證）');
          resolve({ statusCode: res.statusCode, message: '認證失敗' });
        } else {
          console.log('❌ GET 請求回應異常');
          reject(new Error(`預期 401，實際: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ 請求錯誤:', err.message);
      reject(err);
    });

    req.end();
  });
}

// 主測試函數
async function runTests() {
  try {
    console.log('🔍 測試 1: OPTIONS 預檢請求');
    await testOptionsRequest();
    
    console.log('\n🔍 測試 2: GET 請求（無認證）');
    await testGetRequest();
    
    console.log('\n🎉 所有測試通過！CORS 預檢請求處理正常。');
    
  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message);
    process.exit(1);
  }
}

// 檢查伺服器是否運行
function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: testConfig.host,
      port: testConfig.port,
      path: '/api/health',
      method: 'GET'
    }, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ 伺服器正在運行');
        resolve(true);
      } else {
        reject(new Error(`伺服器回應異常: ${res.statusCode}`));
      }
    });

    req.on('error', () => {
      reject(new Error('無法連接到伺服器，請確保伺服器正在運行'));
    });

    req.end();
  });
}

// 執行測試
async function main() {
  try {
    await checkServer();
    await runTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    process.exit(1);
  }
}

main();

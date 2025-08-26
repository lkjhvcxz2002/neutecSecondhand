#!/usr/bin/env node

/**
 * Railway Volume 診斷腳本
 * 檢查 Railway Volume 掛載狀態和配置
 */

const railwayVolume = require('../config/railway-volume');
const { getDatabaseConfig } = require('../config/env');
const fs = require('fs');
const path = require('path');

console.log('🔍 Railway Volume 診斷開始...\n');

async function diagnoseRailwayVolume() {
  try {
    // 1. 檢查環境變數
    console.log('📋 環境變數檢查:');
    console.log(`✅ RAILWAY_ENVIRONMENT: ${process.env.RAILWAY_ENVIRONMENT || '未設置'}`);
    console.log(`✅ RAILWAY_PROJECT_ID: ${process.env.RAILWAY_PROJECT_ID || '未設置'}`);
    console.log(`✅ RAILWAY_SERVICE_NAME: ${process.env.RAILWAY_SERVICE_NAME || '未設置'}`);
    console.log(`✅ RAILWAY_VOLUME_MOUNT_PATH: ${process.env.RAILWAY_VOLUME_MOUNT_PATH || '未設置'}`);
    console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || '未設置'}`);

    // 2. 檢查 Railway Volume 配置
    console.log('\n🚂 Railway Volume 配置:');
    console.log(`✅ 存儲類型: ${railwayVolume.getStorageType()}`);
    console.log(`✅ 是否 Railway 環境: ${railwayVolume.isRailway()}`);
    console.log(`✅ 資料庫路徑: ${railwayVolume.getDatabasePath()}`);
    console.log(`✅ 上傳路徑: ${railwayVolume.getUploadPath()}`);
    console.log(`✅ 頭像路徑: ${railwayVolume.getAvatarPath()}`);
    console.log(`✅ 商品圖片路徑: ${railwayVolume.getProductImagePath()}`);

    // 3. 檢查資料庫配置
    console.log('\n🗄️ 資料庫配置:');
    const dbConfig = getDatabaseConfig();
    console.log(`✅ 資料庫類型: ${dbConfig.type}`);
    console.log(`✅ 資料庫路徑: ${dbConfig.path}`);
    console.log(`✅ 上傳路徑: ${dbConfig.uploadPath}`);

    // 4. 檢查目錄存在性
    console.log('\n📁 目錄存在性檢查:');
    
    const dirsToCheck = [
      { name: '資料庫目錄', path: path.dirname(railwayVolume.getDatabasePath()) },
      { name: '上傳目錄', path: railwayVolume.getUploadPath() },
      { name: '頭像目錄', path: railwayVolume.getAvatarPath() },
      { name: '商品圖片目錄', path: railwayVolume.getProductImagePath() }
    ];

    for (const dir of dirsToCheck) {
      try {
        if (fs.existsSync(dir.path)) {
          const stats = fs.statSync(dir.path);
          console.log(`✅ ${dir.name}: ${dir.path} (${stats.isDirectory() ? '目錄' : '檔案'})`);
        } else {
          console.log(`❌ ${dir.name}: ${dir.path} (不存在)`);
        }
      } catch (error) {
        console.log(`❌ ${dir.name}: ${dir.path} (檢查失敗: ${error.message})`);
      }
    }

    // 5. 檢查資料庫連接
    console.log('\n🔗 資料庫連接測試:');
    try {
      const railwayDb = require('../config/railway-db');
      
      if (railwayDb.isConnected()) {
        console.log('✅ SQLite 資料庫連接成功');
        
        // 測試查詢
        try {
          const result = await railwayDb.get('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"');
          console.log(`✅ 資料庫查詢測試成功，表數量: ${result.count}`);
        } catch (queryError) {
          console.log(`❌ 資料庫查詢測試失敗: ${queryError.message}`);
        }
      } else {
        console.log('❌ SQLite 資料庫未連接');
      }
    } catch (dbError) {
      console.log(`❌ 資料庫連接測試失敗: ${dbError.message}`);
    }

    // 6. 檢查檔案權限
    console.log('\n🔐 檔案權限檢查:');
    if (railwayVolume.isRailway()) {
      const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH || '/data';
      
      try {
        // 測試寫入權限
        const testFile = path.join(volumePath, 'test-write.txt');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('✅ Volume 寫入權限正常');
      } catch (writeError) {
        console.log(`❌ Volume 寫入權限失敗: ${writeError.message}`);
      }

      try {
        // 測試讀取權限
        fs.readdirSync(volumePath);
        console.log('✅ Volume 讀取權限正常');
      } catch (readError) {
        console.log(`❌ Volume 讀取權限失敗: ${readError.message}`);
      }
    } else {
      console.log('ℹ️  本地環境，跳過權限檢查');
    }

    console.log('\n🎉 Railway Volume 診斷完成！');

  } catch (error) {
    console.error('❌ 診斷失敗:', error);
  }
}

diagnoseRailwayVolume()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 診斷失敗:', error);
    process.exit(1);
  });

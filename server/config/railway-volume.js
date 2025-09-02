const path = require('path');
const fs = require('fs');

class RailwayVolume {
  constructor() {
    this.volumePath = null;
    this.databasePath = null;
    this.uploadsPath = null;
    this.avatarsPath = null;
    this.productsPath = null;
    this.init();
  }

  init() {
    try {
      const isRailway = process.env.RAILWAY_ENVIRONMENT || 
                        process.env.RAILWAY_PROJECT_ID ||
                        process.env.RAILWAY_SERVICE_NAME;
      
      if (isRailway) {
        // 在 Railway 環境中，使用 Volume 路徑
        this.volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH || '/data';
        this.databasePath = path.join(this.volumePath, 'database.db');
        this.uploadsPath = path.join(this.volumePath, 'uploads');
        this.avatarsPath = path.join(this.volumePath, 'uploads', 'avatars');
        this.productsPath = path.join(this.volumePath, 'uploads', 'products');
        
        this.ensureDirectories();
        console.log('🚂 Railway Volume 已初始化');
        console.log(`📁 Volume 掛載路徑: ${this.volumePath}`);
        console.log(`🗄️ 資料庫路徑: ${this.databasePath}`);
        console.log(`📁 上傳路徑: ${this.uploadsPath}`);
        console.log(`👤 頭像路徑: ${this.avatarsPath}`);
        console.log(`📦 商品圖片路徑: ${this.productsPath}`);
      } else {
        // 本地開發環境
        this.volumePath = null;
        this.databasePath = './database/database.sqlite';
        this.uploadsPath = './uploads';
        this.avatarsPath = './uploads/avatars';
        this.productsPath = './uploads/products';
        this.ensureDirectories();
        console.log('💻 本地上傳目錄已初始化');
      }
    } catch (error) {
      console.error('❌ Volume 初始化失敗:', error);
    }
  }

  // 確保目錄存在
  ensureDirectories() {
    try {
      const dirs = [
        path.dirname(this.databasePath),
        this.uploadsPath,
        this.avatarsPath,
        this.productsPath
      ];

      for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`✅ 創建目錄: ${dir}`);
        }
      }
    } catch (error) {
      console.error('❌ 創建目錄失敗:', error);
    }
  }

  // 獲取資料庫路徑
  getDatabasePath() {
    return this.databasePath;
  }

  // 獲取上傳路徑
  getUploadPath() {
    return this.uploadsPath;
  }

  // 獲取頭像路徑
  getAvatarPath() {
    return this.avatarsPath;
  }

  // 獲取商品圖片路徑
  getProductImagePath() {
    return this.productsPath;
  }

  // 獲取存儲類型
  getStorageType() {
    return this.volumePath ? 'Railway Volume' : 'Local Storage';
  }

  // 檢查是否在 Railway 環境
  isRailway() {
    return this.volumePath !== null;
  }
}

// 創建單例實例
const railwayVolume = new RailwayVolume();

module.exports = railwayVolume;

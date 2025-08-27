const sqlite3 = require('sqlite3').verbose();
const railwayVolume = require('./railway-volume');

class RailwayDatabase {
  constructor() {
    this.db = null;
    this.dbPath = railwayVolume.getDatabasePath();
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      console.log(`🗄️ 初始化 SQLite 資料庫: ${this.dbPath}`);
      
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ SQLite 資料庫連接失敗:', err.message);
          this.initialized = false;
        } else {
          console.log('✅ SQLite 資料庫連接成功');
          
          // 啟用外鍵約束
          this.db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
              console.error('❌ 啟用外鍵約束失敗:', err.message);
            } else {
              console.log('✅ 外鍵約束已啟用');
            }
          });
          
          // 設置 WAL 模式以提高性能
          this.db.run('PRAGMA journal_mode = WAL', (err) => {
            if (err) {
              console.error('❌ 設置 WAL 模式失敗:', err.message);
            } else {
              console.log('✅ WAL 模式已設置');
            }
          });
          
          // 設置同步模式
          this.db.run('PRAGMA synchronous = NORMAL', (err) => {
            if (err) {
              console.error('❌ 設置同步模式失敗:', err.message);
            } else {
              console.log('✅ 同步模式已設置');
            }
          });
          
          this.initialized = true;
        }
      });
      
    } catch (error) {
      console.error('❌ SQLite 初始化失敗:', error);
      this.initialized = false;
    }
  }

  // 獲取單筆記錄
  get(sql, params = [], callback) {
    if (typeof callback === 'function') {
      this.db.get(sql, params, callback);
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
  }

  // 獲取多筆記錄
  all(sql, params = [], callback) {
    if (typeof callback === 'function') {
      this.db.all(sql, params, callback);
    } else {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
  }

  // 執行插入、更新、刪除操作
  run(sql, params = [], callback) {
    if (typeof callback === 'function') {
      this.db.run(sql, params, callback);
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
  }

  // 執行查詢
  query(sql, params = [], callback) {
    if (typeof callback === 'function') {
      this.db.all(sql, params, callback);
    } else {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      });
    }
  }

  // 關閉資料庫連接
  close(callback) {
    if (this.db) {
      this.db.close(callback);
    }
  }

  // 檢查資料庫是否已連接
  isConnected() {
    return this.db !== null && this.initialized;
  }

  // 獲取存儲類型
  getStorageType() {
    return railwayVolume.getStorageType();
  }

  // 獲取資料庫路徑
  getDatabasePath() {
    return this.dbPath;
  }
}

// 創建單例實例
const railwayDb = new RailwayDatabase();

module.exports = railwayDb;

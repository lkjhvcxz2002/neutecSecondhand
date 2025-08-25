const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// 載入環境配置
const { 
  loadEnvironmentConfig, 
  getServerConfig, 
  getSecurityConfig,
  showConfigSummary 
} = require('./config/env');

// 載入環境變數
loadEnvironmentConfig();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const maintenanceRoutes = require('./routes/maintenance');
const { initDatabase } = require('./database/init');
const { verifyEmailConfig } = require('./services/emailService');

const app = express();

// 獲取配置
const serverConfig = getServerConfig();
const securityConfig = getSecurityConfig();

// 中間件
if (securityConfig.helmetEnabled) {
  app.use(helmet());
}

// CORS 配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允許的來源列表
    const allowedOrigins = [
      'http://localhost:3000',                    // 本地開發
      'https://neutecsecondhand.vercel.app',      // Vercel 生產環境
      'https://neutecsecondhand.vercel.app',      // Vercel 預覽環境
      'https://neutec-secondhand.vercel.app'      // Vercel 自訂域名
    ];
    
    // 允許沒有 origin 的請求（如 Postman、curl 等）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS 拒絕來源: ${origin}`);
      callback(new Error('不允許的來源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// 處理 OPTIONS 預檢請求
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案服務
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '二手交換平台API運行中',
    environment: serverConfig.env,
    timestamp: new Date().toISOString()
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: '伺服器內部錯誤',
    error: serverConfig.env === 'development' ? err.message : {}
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API端點不存在' });
});

// 啟動伺服器
async function startServer() {
  try {
    // 初始化資料庫
    await initDatabase();
    console.log('資料庫初始化完成');
    
    // 驗證郵件配置
    const emailConfigValid = await verifyEmailConfig();
    if (!emailConfigValid) {
      console.log('⚠️  郵件服務配置有問題，郵件功能可能無法正常使用');
    }
    
    // 顯示配置摘要
    showConfigSummary();
    
    app.listen(serverConfig.port, serverConfig.host, () => {
      console.log(`🚀 伺服器運行在 http://${serverConfig.host}:${serverConfig.port}`);
      console.log(`🌍 環境: ${serverConfig.env}`);
      console.log('二手交換平台後端API已啟動');
    });
  } catch (error) {
    console.error('啟動伺服器失敗:', error);
    process.exit(1);
  }
}

startServer();

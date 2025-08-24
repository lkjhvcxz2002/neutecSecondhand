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

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

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

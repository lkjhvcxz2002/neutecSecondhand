const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// 載入環境配置
const { 
  loadEnvironmentConfig, 
  getServerConfig, 
  getSecurityConfig,
  getImageCorsConfig,
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
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
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
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// 處理 OPTIONS 預檢請求
app.options('*', cors(corsOptions));

// 添加 CORS 調試日誌
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log(`🔄 CORS 預檢請求: ${req.method} ${req.path}`);
    console.log(`🌐 請求來源: ${req.headers.origin}`);
    console.log(`📋 請求方法: ${req.headers['access-control-request-method']}`);
    console.log(`📋 請求標頭: ${req.headers['access-control-request-headers']}`);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 專門的圖片服務路由 - 確保 CORS 標頭正確設置
app.get('/uploads/*', (req, res, next) => {
  // 獲取圖片 CORS 配置
  const imageCorsConfig = getImageCorsConfig();
  
  // 檢查請求來源
  const origin = req.headers.origin;
  
  console.log(`🖼️ 圖片請求: ${req.path}`);
  console.log(`🌐 請求來源: ${origin}`);
  console.log(`✅ 允許的來源: ${imageCorsConfig.allowedOrigins.join(', ')}`);
  
  // 設置 CORS 標頭 - 必須在發送任何內容之前設置
  if (origin && imageCorsConfig.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ 設置 CORS Origin: ${origin}`);
  } else {
    console.log(`❌ 來源不在允許列表中: ${origin}`);
  }
  
  // 設置其他必要的 CORS 標頭
  res.setHeader('Access-Control-Allow-Methods', imageCorsConfig.allowMethods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', imageCorsConfig.allowHeaders.join(', '));
  res.setHeader('Access-Control-Allow-Credentials', imageCorsConfig.allowCredentials.toString());
  
  console.log(`✅ CORS 標頭已設置:`, {
    'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers'),
    'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials')
  });
  
  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  const imagePath = req.path.replace('/uploads', '');
  const fullPath = path.join(__dirname, 'uploads', imagePath);
  
  // 檢查檔案是否存在
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: '圖片不存在' });
  }
  
  // 設置正確的 Content-Type
  const ext = path.extname(fullPath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  
  // 設置快取標頭
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年快取
  
  // 發送檔案
  res.sendFile(fullPath);
});

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

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// 中間件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案服務
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '二手交換平台API運行中' });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: '伺服器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
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
    
    app.listen(PORT, () => {
      console.log(`伺服器運行在 http://localhost:${PORT}`);
      console.log('二手交換平台後端API已啟動');
    });
  } catch (error) {
    console.error('啟動伺服器失敗:', error);
    process.exit(1);
  }
}

startServer();

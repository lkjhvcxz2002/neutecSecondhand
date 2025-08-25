const path = require('path');
const fs = require('fs');

// 載入環境變數
const loadEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const envPath = path.join(__dirname, '..', `.env.${env}`);
  const commonPath = path.join(__dirname, '..', '.env.common');
  
  console.log(`🌍 載入環境配置: ${env}`);
  
  // 載入通用配置
  if (fs.existsSync(commonPath)) {
    require('dotenv').config({ path: commonPath });
    console.log('✅ 通用配置已載入');
  }
  
  // 載入環境特定配置
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`✅ ${env} 環境配置已載入`);
  } else {
    console.log(`⚠️  ${env} 環境配置檔案不存在: ${envPath}`);
  }
  
  // 載入本地配置（如果存在）
  const localPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(localPath)) {
    require('dotenv').config({ path: localPath });
    console.log('✅ 本地配置已載入');
  }
  
  // 驗證必要配置
  validateRequiredConfig();
};

// 驗證必要配置
const validateRequiredConfig = () => {
  const required = [
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ 缺少必要配置: ${missing.join(', ')}`);
    console.error('請檢查環境變數檔案是否包含所有必要配置');
    process.exit(1);
  }
  
  // 檢查郵件配置（可選）
  const emailRequired = ['EMAIL_SERVICE', 'EMAIL_USER', 'EMAIL_PASS'];
  const emailMissing = emailRequired.filter(key => !process.env[key]);
  
  if (emailMissing.length > 0) {
    console.warn(`⚠️  郵件配置不完整: ${emailMissing.join(', ')}`);
    console.warn('郵件功能將被禁用');
  }
  
  console.log('✅ 所有必要配置已驗證');
};

// 獲取配置值
const getConfig = (key, defaultValue = null) => {
  return process.env[key] || defaultValue;
};

// 獲取郵件配置
const getEmailConfig = () => {
  return {
    service: getConfig('EMAIL_SERVICE'),
    user: getConfig('EMAIL_USER'),
    pass: getConfig('EMAIL_PASS')
  };
};

// 獲取伺服器配置
const getServerConfig = () => {
  // 檢測是否在 Railway 環境中
  const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || 
                    process.env.RAILWAY_PROJECT_ID || 
                    process.env.RAILWAY_SERVICE_NAME;
  
  return {
    port: parseInt(process.env.PORT) || parseInt(getConfig('PORT', 5000)),
    host: isRailway ? '0.0.0.0' : getConfig('HOST', 'localhost'),
    env: getConfig('NODE_ENV', 'development')
  };
};

// 獲取資料庫配置
const getDatabaseConfig = () => {
  // 檢測是否在 Railway 環境中
  const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || 
                    process.env.RAILWAY_PROJECT_ID || 
                    process.env.RAILWAY_SERVICE_NAME;
  
  return {
    path: isRailway ? ':memory:' : getConfig('DB_PATH', './database/secondhand.db'),
    uploadPath: isRailway ? '/tmp/uploads' : getConfig('UPLOAD_PATH', './uploads'),
    maxFileSize: parseInt(getConfig('MAX_FILE_SIZE', 5242880))
  };
};

// 獲取 JWT 配置
const getJWTConfig = () => {
  return {
    secret: getConfig('JWT_SECRET'),
    expiresIn: getConfig('JWT_EXPIRES_IN', '7d')
  };
};

// 獲取安全配置
const getSecurityConfig = () => {
  return {
    helmetEnabled: getConfig('HELMET_ENABLED', 'true') === 'true',
    rateLimitEnabled: getConfig('RATE_LIMIT_ENABLED', 'false') === 'true',
    rateLimitWindow: parseInt(getConfig('RATE_LIMIT_WINDOW', 900000)),
    rateLimitMax: parseInt(getConfig('RATE_LIMIT_MAX', 100)),
    corsEnabled: getConfig('CORS_ENABLED', 'true') === 'true',
    allowedOrigins: getConfig('ALLOWED_ORIGINS', 'http://localhost:3000,https://neutecsecondhand.vercel.app').split(',')
  };
};

// 獲取維護模式配置
const getMaintenanceConfig = () => {
  return {
    enabled: getConfig('MAINTENANCE_MODE', 'false') === 'true'
  };
};

// 顯示當前配置摘要
const showConfigSummary = () => {
  const dbConfig = getDatabaseConfig();
  const serverConfig = getServerConfig();
  const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || 
                    process.env.RAILWAY_PROJECT_ID || 
                    process.env.RAILWAY_SERVICE_NAME;
  
  console.log('\n📋 配置摘要:');
  console.log('================');
  console.log(`環境: ${getConfig('NODE_ENV', 'development')}`);
  console.log(`伺服器: ${serverConfig.host}:${serverConfig.port}`);
  console.log(`郵件服務: ${getConfig('EMAIL_SERVICE')}`);
  console.log(`郵件帳號: ${getConfig('EMAIL_USER')}`);
  console.log(`資料庫: ${dbConfig.path}${isRailway ? ' (記憶體資料庫)' : ''}`);
  console.log(`維護模式: ${getConfig('MAINTENANCE_MODE', 'false')}`);
  console.log('================\n');
};

module.exports = {
  loadEnvironmentConfig,
  getConfig,
  getEmailConfig,
  getServerConfig,
  getDatabaseConfig,
  getJWTConfig,
  getSecurityConfig,
  getMaintenanceConfig,
  showConfigSummary
};

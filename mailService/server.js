const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Mail Service',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 郵件服務狀態檢查
app.get('/status', (req, res) => {
  try {
    const hasEmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    
    res.json({
      success: true,
      data: {
        isInitialized: hasEmailConfig,
        hasEmailConfig,
        fromEmail: process.env.EMAIL_USER || '未設定',
        service: process.env.EMAIL_SERVICE || 'gmail'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '狀態檢查失敗',
      error: error.message
    });
  }
});

// 發送郵件 API
app.post('/send', async (req, res) => {
  try {
    const { receivers, subject, content, contentType = 'text' } = req.body;
    
    // 驗證必要參數
    if (!receivers || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數：receivers, subject, content'
      });
    }
    
    // 驗證 receivers 格式
    if (!Array.isArray(receivers) || receivers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'receivers 必須是非空陣列'
      });
    }
    
    // 驗證郵箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = receivers.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: `無效的郵箱格式: ${invalidEmails.join(', ')}`
      });
    }
    
    console.log(`📧 準備發送郵件到 ${receivers.length} 個收件人`);
    console.log(`📋 主題: ${subject}`);
    console.log(`📝 內容類型: ${contentType}`);
    
    // 建立郵件傳輸器
    const transporter = createTransporter();
    
    // 發送郵件
    const mailOptions = {
      from: `"風格妍究社 - 二手交換平台" <${process.env.EMAIL_USER}>`,
      to: receivers.join(', '),
      subject: subject,
      ...(contentType === 'html' ? { html: content } : { text: content })
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ 郵件發送成功:', result.messageId);
    
    res.json({
      success: true,
      message: '郵件發送成功',
      data: {
        messageId: result.messageId,
        receivers: receivers,
        subject: subject,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ 郵件發送失敗:', error);
    
    res.status(500).json({
      success: false,
      message: '郵件發送失敗',
      error: error.message
    });
  }
});

// 批量發送郵件 API
app.post('/send-batch', async (req, res) => {
  try {
    const { emails } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'emails 必須是非空陣列'
      });
    }
    
    console.log(`📧 準備批量發送 ${emails.length} 封郵件`);
    
    const transporter = createTransporter();
    const results = [];
    const errors = [];
    
    // 逐一發送郵件
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      try {
        const { receivers, subject, content, contentType = 'text' } = email;
        
        if (!receivers || !subject || !content) {
          errors.push({ index: i, error: '缺少必要參數' });
          continue;
        }
        
        const mailOptions = {
          from: `"風格妍究社 - 二手交換平台" <${process.env.EMAIL_USER}>`,
          to: Array.isArray(receivers) ? receivers.join(', ') : receivers,
          subject: subject,
          ...(contentType === 'html' ? { html: content } : { text: content })
        };
        
        const result = await transporter.sendMail(mailOptions);
        results.push({
          index: i,
          success: true,
          messageId: result.messageId
        });
        
        console.log(`✅ 第 ${i + 1}/${emails.length} 封郵件發送成功`);
        
      } catch (error) {
        console.error(`❌ 第 ${i + 1}/${emails.length} 封郵件發送失敗:`, error.message);
        errors.push({ index: i, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: '批量發送完成',
      data: {
        total: emails.length,
        success: results.length,
        failed: errors.length,
        results,
        errors
      }
    });
    
  } catch (error) {
    console.error('❌ 批量發送失敗:', error);
    res.status(500).json({
      success: false,
      message: '批量發送失敗',
      error: error.message
    });
  }
});

// 郵件服務配置
const getEmailConfig = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // 根據服務類型返回不同配置
  switch (emailService.toLowerCase()) {
    case 'proton':
      return {
        host: '127.0.0.1',
        port: 1025,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass
        },
        // Proton Mail Bridge 配置
        tls: {
          rejectUnauthorized: false
        }
      };

    case 'outlook':
      return {
        service: 'outlook',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      };

    case 'yahoo':
      return {
        service: 'yahoo',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      };

    case 'gmail':
      return {
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      };

    case 'ethereal':
      // 測試用郵件服務
      return {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: emailUser || 'test@ethereal.email',
          pass: emailPass || 'test123'
        }
      };

    case 'custom':
      // 自定義 SMTP 伺服器
      return {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      };

    default:
      // 預設使用 Proton Mail
      return {
        host: '127.0.0.1',
        port: 1025,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      };
  }
};

// 創建郵件傳輸器
const createTransporter = () => {
  const config = getEmailConfig();
  console.log('📧 郵件服務配置:', {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: config.host || config.service,
    port: config.port,
    user: config.auth.user,
    pass: config.auth.pass
  });
  
  return nodemailer.createTransport(config);
};

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('❌ 伺服器錯誤:', err);
  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 端點不存在'
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 郵件服務已啟動在端口 ${PORT}`);
  console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 服務: ${process.env.EMAIL_SERVICE || 'gmail'} SMTP, 
    環境變數: EMAIL_USER: ${process.env.EMAIL_USER}, EMAIL_PASS: ${process.env.EMAIL_PASS}`);
});

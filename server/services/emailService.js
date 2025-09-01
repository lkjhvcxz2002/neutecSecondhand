const axios = require('axios');

// 外部郵件服務配置
const MAIL_SERVICE_URL = process.env.MAIL_SERVICE_URL;

// 驗證郵件服務狀態
const verifyEmailConfig = async () => {
  try {
    console.log('🚀 開始驗證外部郵件服務...');
    
    const response = await axios.get(`${MAIL_SERVICE_URL}/status`, {
      timeout: 10000
    });
    
    if (response.data.success && response.data.data.isInitialized) {
      console.log('✅ 外部郵件服務配置驗證成功');
      console.log(`📧 服務: ${response.data.data.service}`);
      console.log(`📮 發件人: ${response.data.data.fromEmail}`);
      return true;
    } else {
      console.log('⚠️ 外部郵件服務未完全初始化');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 外部郵件服務配置驗證失敗:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 建議：檢查郵件服務是否正在運行');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 建議：檢查郵件服務 URL 是否正確');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 建議：檢查網路連接和防火牆設定');
    }
    
    return false;
  }
};

// 發送郵件到外部服務的通用函數
const sendEmailToExternalService = async (mailData) => {
  try {
    console.log('📧 準備發送郵件到外部服務...');
    console.log(`📋 主題: ${mailData.subject}`);
    console.log(`📮 收件人: ${mailData.receivers.join(', ')}`);
    
    const response = await axios.post(`${MAIL_SERVICE_URL}/send`, mailData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ 郵件發送成功:', response.data.data.messageId);
      return { success: true, messageId: response.data.data.messageId };
    } else {
      throw new Error(response.data.message || '郵件發送失敗');
    }
    
  } catch (error) {
    console.error('❌ 郵件發送失敗:', error.message);
    return { success: false, error: error.message };
  }
};

// 發送重設密碼郵件
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailData = {
      receivers: [userEmail],
      subject: '重設密碼 - 二手交換平台',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">二手交換平台</h1>
          </div>
          
          <div style="padding: 20px; background-color: #ffffff;">
            <h2 style="color: #333;">您好 ${userName}，</h2>
            
            <p style="color: #666; line-height: 1.6;">
              我們收到了您重設密碼的請求。如果這不是您本人的操作，請忽略此郵件。
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: #ffffff; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                重設密碼
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              或者您可以複製以下連結到瀏覽器地址欄：
            </p>
            
            <p style="color: #007bff; word-break: break-all; background-color: #f8f9fa; 
                       padding: 10px; border-radius: 3px;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              <strong>注意：</strong>此連結將在 1 小時後失效。
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px;">
              如果您有任何問題，請聯繫系統管理員：<br>
              <a href="https://t.me/ParkerDuTW" style="color: #007bff;">@ParkerDuTW</a>
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 14px;">
              © 2024 二手交換平台. 此郵件由系統自動發送，請勿回覆。
            </p>
          </div>
        </div>
      `,
      contentType: 'html'
    };

    return await sendEmailToExternalService(mailData);
    
  } catch (error) {
    console.error(`❌ 發送重設密碼郵件失敗: ${userEmail}`, error);
    return { success: false, error: error.message };
  }
};

// 發送歡迎郵件
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const mailData = {
      receivers: [userEmail],
      subject: '歡迎加入二手交換平台！',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">🎉 歡迎加入！</h1>
          </div>
          
          <div style="padding: 20px; background-color: #ffffff;">
            <h2 style="color: #333;">您好 ${userName}，</h2>
            
            <p style="color: #666; line-height: 1.6;">
              感謝您註冊二手交換平台！我們很高興您能加入我們的社群。
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">平台特色：</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>🔍 輕鬆搜尋和瀏覽商品</li>
                <li>💬 直接與賣家聯繫</li>
                <li>📱 支援 Telegram 即時通訊</li>
                <li>🛡️ 安全的交易環境</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background-color: #28a745; color: #ffffff; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                開始探索平台
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              如果您有任何問題或需要協助，請隨時聯繫我們：
            </p>
            
            <p style="color: #007bff; text-align: center;">
              <a href="https://t.me/ParkerDuTW" style="color: #007bff;">@ParkerDuTW</a>
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 14px;">
              © 2024 二手交換平台. 此郵件由系統自動發送，請勿回覆。
            </p>
          </div>
        </div>
      `,
      contentType: 'html'
    };

    return await sendEmailToExternalService(mailData);
    
  } catch (error) {
    console.error(`❌ 發送歡迎郵件失敗: ${userEmail}`, error);
    return { success: false, error: error.message };
  }
};

// 發送帳戶狀態變更通知
const sendAccountStatusEmail = async (userEmail, userName, status, reason = '') => {
  try {
    const statusText = status === 'active' ? '啟用' : '封鎖';
    const statusColor = status === 'active' ? '#28a745' : '#dc3545';
    
    const mailData = {
      receivers: [userEmail],
      subject: `帳戶狀態變更 - 二手交換平台`,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${statusColor}; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">帳戶狀態變更</h1>
          </div>
          
          <div style="padding: 20px; background-color: #ffffff;">
            <h2 style="color: #333;">您好 ${userName}，</h2>
            
            <p style="color: #666; line-height: 1.6;">
              您的帳戶狀態已變更為：<strong style="color: ${statusColor};">${statusText}</strong>
            </p>
            
            ${reason ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">變更原因：</h3>
              <p style="color: #666; margin: 0;">${reason}</p>
            </div>
            ` : ''}
            
            <p style="color: #666; line-height: 1.6;">
              如果您對此次變更有任何疑問，請聯繫系統管理員：
            </p>
            
            <p style="color: #007bff; text-align: center;">
              <a href="https://t.me/ParkerDuTW" style="color: #007bff;">@ParkerDuTW</a>
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 14px;">
              © 2024 二手交換平台. 此郵件由系統自動發送，請勿回覆。
            </div>
          </div>
        </div>
      `,
      contentType: 'html'
    };

    return await sendEmailToExternalService(mailData);
    
  } catch (error) {
    console.error(`❌ 發送帳戶狀態變更郵件失敗: ${userEmail}`, error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  verifyEmailConfig,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAccountStatusEmail
};

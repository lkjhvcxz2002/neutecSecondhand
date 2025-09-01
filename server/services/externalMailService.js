const axios = require('axios');

class MailService {
  constructor() {
    this.mailServiceUrl = process.env.MAIL_SERVICE_URL;
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (this.mailServiceUrl) {
      this.isInitialized = true;
      console.log('✅ 外部郵件服務已初始化');
      console.log(`📧 服務 URL: ${this.mailServiceUrl}`);
    } else {
      console.warn('⚠️ MAIL_SERVICE_URL 未設定，郵件功能將被禁用');
    }
  }

  // 檢查郵件服務狀態
  async checkStatus() {
    if (!this.isInitialized) {
      throw new Error('郵件服務未初始化');
    }

    try {
      const response = await axios.get(`${this.mailServiceUrl}/status`, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('❌ 郵件服務狀態檢查失敗:', error.message);
      throw new Error(`郵件服務狀態檢查失敗: ${error.message}`);
    }
  }

  // 發送測試郵件
  async sendTestEmail(toEmail, subject = '測試郵件') {
    if (!this.isInitialized) {
      throw new Error('郵件服務未初始化');
    }

    try {
      const mailData = {
        receivers: [toEmail],
        subject: subject,
        content: `
🎉 測試郵件發送成功！

這是一封來自你的二手交換平台的測試郵件。

📧 郵件詳情：
發送時間：${new Date().toLocaleString('zh-TW')}
收件人：${toEmail}
主題：${subject}

如果你收到這封郵件，表示外部郵件服務已經成功整合到你的應用程式中！

---
此郵件由二手交換平台自動發送，請勿回覆。
        `,
        contentType: 'text'
      };

      const response = await axios.post(`${this.mailServiceUrl}/send`, mailData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ 測試郵件發送成功:', response.data.data.messageId);
        return response.data;
      } else {
        throw new Error(response.data.message || '郵件發送失敗');
      }

    } catch (error) {
      console.error('❌ 測試郵件發送失敗:', error.message);
      throw new Error(`測試郵件發送失敗: ${error.message}`);
    }
  }

  // 發送歡迎郵件
  async sendWelcomeEmail(toEmail, userName) {
    if (!this.isInitialized) {
      throw new Error('郵件服務未初始化');
    }

    try {
      const mailData = {
        receivers: [toEmail],
        subject: '歡迎加入二手交換平台！',
        content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">🎉 歡迎加入二手交換平台！</h2>
  
  <p>親愛的 <strong>${userName}</strong>，</p>
  
  <p>感謝你註冊我們的二手交換平台！我們很高興你選擇加入我們的社群。</p>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #666;">🚀 開始使用平台</h3>
    <ul>
      <li>瀏覽和搜尋二手商品</li>
      <li>發布你的二手物品</li>
      <li>與其他用戶交流</li>
      <li>享受環保的二手交易體驗</li>
    </ul>
  </div>
  
  <p>如果你有任何問題或建議，請隨時聯繫我們的客服團隊。</p>
  
  <p>再次歡迎你的加入！</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
  <p style="color: #999; font-size: 12px;">
    此郵件由二手交換平台自動發送，請勿回覆。
  </p>
</div>
        `,
        contentType: 'html'
      };

      const response = await axios.post(`${this.mailServiceUrl}/send`, mailData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ 歡迎郵件發送成功:', response.data.data.messageId);
        return response.data;
      } else {
        throw new Error(response.data.message || '郵件發送失敗');
      }

    } catch (error) {
      console.error('❌ 歡迎郵件發送失敗:', error.message);
      throw new Error(`歡迎郵件發送失敗: ${error.message}`);
    }
  }

  // 發送密碼重設郵件
  async sendPasswordResetEmail(toEmail, resetToken, resetUrl) {
    if (!this.isInitialized) {
      throw new Error('郵件服務未初始化');
    }

    try {
      const mailData = {
        receivers: [toEmail],
        subject: '密碼重設請求',
        content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">🔐 密碼重設請求</h2>
  
  <p>你最近請求重設密碼。如果這不是你發起的請求，請忽略此郵件。</p>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #666;">重設密碼</h3>
    <p>請點擊下面的按鈕重設你的密碼：</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="${resetUrl}?token=${resetToken}" 
         style="background-color: #007bff; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 5px; display: inline-block;">
      重設密碼
      </a>
    </div>
    
    <p style="font-size: 12px; color: #666;">
      如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
      <a href="${resetUrl}?token=${resetToken}">${resetUrl}?token=${resetToken}</a>
    </p>
  </div>
  
  <p><strong>注意：</strong>此連結將在 1 小時後失效。</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
  <p style="color: #999; font-size: 12px;">
    此郵件由二手交換平台自動發送，請勿回覆。
  </p>
</div>
        `,
        contentType: 'html'
      };

      const response = await axios.post(`${this.mailServiceUrl}/send`, mailData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ 密碼重設郵件發送成功:', response.data.data.messageId);
        return response.data;
      } else {
        throw new Error(response.data.message || '郵件發送失敗');
      }

    } catch (error) {
      console.error('❌ 密碼重設郵件發送失敗:', error.message);
      throw new Error(`密碼重設郵件發送失敗: ${error.message}`);
    }
  }

  // 批量發送測試郵件
  async sendBatchTestEmails(emails, subject = '批量測試郵件') {
    if (!this.isInitialized) {
      throw new Error('郵件服務未初始化');
    }

    try {
      const batchData = {
        emails: emails.map(email => ({
          receivers: [email],
          subject: subject,
          content: `
🎉 批量測試郵件發送成功！

這是一封來自你的二手交換平台的批量測試郵件。

📧 郵件詳情：
發送時間：${new Date().toLocaleString('zh-TW')}
收件人：${email}
主題：${subject}

如果你收到這封郵件，表示批量郵件功能已經成功整合到你的應用程式中！

---
此郵件由二手交換平台自動發送，請勿回覆。
          `,
          contentType: 'text'
        }))
      };

      const response = await axios.post(`${this.mailServiceUrl}/send-batch`, batchData, {
        timeout: 60000, // 批量發送需要更長時間
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ 批量測試郵件發送完成:', response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.message || '批量郵件發送失敗');
      }

    } catch (error) {
      console.error('❌ 批量測試郵件發送失敗:', error.message);
      throw new Error(`批量測試郵件發送失敗: ${error.message}`);
    }
  }

  // 獲取服務狀態
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      serviceUrl: this.mailServiceUrl,
      service: 'External Mail Service API'
    };
  }
}

module.exports = new MailService();

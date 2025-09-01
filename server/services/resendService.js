const { Resend } = require('resend');

class ResendService {
  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.resend = null;
    this.isInitialized = false;
    // this.init();
  }

  // init() {
  //   try {
  //     const apiKey = this.apiKey;
  //     if (apiKey) {
  //       this.resend = new Resend(apiKey);
  //       this.isInitialized = true;
  //       console.log('✅ Resend 服務已初始化');
  //       console.log(`🔑 API Key 前綴: ${apiKey.substring(0, 8)}...`);
  //       console.log(`📧 預設發件人: ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}`);
  //     } else {
  //       console.warn('⚠️ RESEND_API_KEY 未設定，郵件功能將被禁用');
  //     }
  //   } catch (error) {
  //     console.error('❌ Resend 服務初始化失敗:', error);
  //   }
  // }

  // 發送測試郵件
  async sendTestEmail(toEmail, subject = 'Resend 測試郵件') {
    if (!this.isInitialized) {
      throw new Error('Resend 服務未初始化');
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: toEmail,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🎉 Resend 郵件測試成功！</h2>
            <p>這是一封來自你的二手交換平台的測試郵件。</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #666;">📧 郵件詳情</h3>
              <p><strong>發送時間：</strong> ${new Date().toLocaleString('zh-TW')}</p>
              <p><strong>收件人：</strong> ${toEmail}</p>
              <p><strong>主題：</strong> ${subject}</p>
            </div>
            <p>如果你收到這封郵件，表示 Resend 郵件服務已經成功整合到你的應用程式中！</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              此郵件由二手交換平台自動發送，請勿回覆。
            </p>
          </div>
        `,
        text: `
          🎉 Resend 郵件測試成功！
          
          這是一封來自你的二手交換平台的測試郵件。
          
          📧 郵件詳情：
          發送時間：${new Date().toLocaleString('zh-TW')}
          收件人：${toEmail}
          主題：${subject}
          
          如果你收到這封郵件，表示 Resend 郵件服務已經成功整合到你的應用程式中！
          
          ---
          此郵件由二手交換平台自動發送，請勿回覆。
        `
      });

      if (error) {
        console.error('❌ Resend API 錯誤詳情:', error);
        throw new Error(`Resend 發送失敗: ${error.message || JSON.stringify(error)}`);
      }

      return {
        success: true,
        messageId: data?.id,
        message: '郵件發送成功',
        data: data
      };
    } catch (error) {
      console.error('❌ Resend 郵件發送失敗:', error);
      throw error;
    }
  }

  // 發送歡迎郵件
  async sendWelcomeEmail(toEmail, userName) {
    if (!this.isInitialized) {
      throw new Error('Resend 服務未初始化');
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: toEmail,
        subject: `歡迎加入二手交換平台，${userName}！`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🎉 歡迎加入二手交換平台！</h2>
            <p>親愛的 ${userName}，</p>
            <p>感謝你註冊我們的二手交換平台！我們很高興你成為我們社群的一員。</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #666;">🚀 開始使用平台</h3>
              <ul style="color: #555;">
                <li>瀏覽其他用戶的商品</li>
                <li>發布你的二手商品</li>
                <li>與其他用戶交流</li>
                <li>找到心儀的商品</li>
              </ul>
            </div>
            
            <p>如果你有任何問題或建議，請隨時聯繫我們。</p>
            <p>祝你在平台上找到心儀的商品！</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              此郵件由二手交換平台自動發送，請勿回覆。
            </p>
          </div>
        `,
        text: `
          🎉 歡迎加入二手交換平台！
          
          親愛的 ${userName}，
          
          感謝你註冊我們的二手交換平台！我們很高興你成為我們社群的一員。
          
          🚀 開始使用平台：
          • 瀏覽其他用戶的商品
          • 發布你的二手商品
          • 與其他用戶交流
          • 找到心儀的商品
          
          如果你有任何問題或建議，請隨時聯繫我們。
          祝你在平台上找到心儀的商品！
          
          ---
          此郵件由二手交換平台自動發送，請勿回覆。
        `
      });

      if (error) {
        console.error('❌ Resend API 錯誤詳情:', error);
        throw new Error(`Resend 發送失敗: ${error.message || JSON.stringify(error)}`);
      }

      return {
        success: true,
        messageId: data?.id,
        message: '歡迎郵件發送成功',
        data: data
      };
    } catch (error) {
      console.error('❌ Resend 歡迎郵件發送失敗:', error);
      throw error;
    }
  }

  // 發送密碼重設郵件
  async sendPasswordResetEmail(toEmail, resetToken, resetUrl) {
    if (!this.isInitialized) {
      throw new Error('Resend 服務未初始化');
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: toEmail,
        subject: '密碼重設請求 - 二手交換平台',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🔐 密碼重設請求</h2>
            <p>你收到了這封郵件是因為你（或其他人）請求重設你的帳戶密碼。</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #666;">📝 重設密碼</h3>
              <p>請點擊下面的按鈕來重設你的密碼：</p>
              <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">重設密碼</a>
              <p style="margin-top: 15px; font-size: 14px; color: #666;">
                如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
                <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
              </p>
            </div>
            
            <p><strong>⚠️ 重要提醒：</strong></p>
            <ul style="color: #555;">
              <li>此連結將在 1 小時後失效</li>
              <li>如果你沒有請求重設密碼，請忽略此郵件</li>
              <li>為了安全起見，請不要將此連結分享給他人</li>
            </ul>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              此郵件由二手交換平台自動發送，請勿回覆。
            </p>
          </div>
        `,
        text: `
          🔐 密碼重設請求
          
          你收到了這封郵件是因為你（或其他人）請求重設你的帳戶密碼。
          
          📝 重設密碼：
          請點擊以下連結來重設你的密碼：
          ${resetUrl}
          
          ⚠️ 重要提醒：
          • 此連結將在 1 小時後失效
          • 如果你沒有請求重設密碼，請忽略此郵件
          • 為了安全起見，請不要將此連結分享給他人
          
          ---
          此郵件由二手交換平台自動發送，請勿回覆。
        `
      });

      if (error) {
        console.error('❌ Resend API 錯誤詳情:', error);
        throw new Error(`Resend 發送失敗: ${error.message || JSON.stringify(error)}`);
      }

      return {
        success: true,
        messageId: data?.id,
        message: '密碼重設郵件發送成功',
        data: data
      };
    } catch (error) {
      console.error('❌ Resend 密碼重設郵件發送失敗:', error);
      throw error;
    }
  }

  // 檢查服務狀態
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasApiKey: !!this.apiKey,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    };
  }
}

// 創建單例實例
const resendService = new ResendService();

module.exports = resendService;

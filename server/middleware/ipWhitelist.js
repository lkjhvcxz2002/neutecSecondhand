// server/middleware/ipWhitelist.js
const path = require('path');

// IP 白名單中間件
const ipWhitelist = (req, res, next) => {
  try {
    // 獲取客戶端 IP
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;
    
    // 清理 IP 格式
    const cleanIP = clientIP.replace(/^::ffff:/, '').split(',')[0].trim();
    
    // 白名單 IP 列表
    const whitelist = [
      // CHT
      '211.20.2.194',
      // FET
      '218.32.64.162',
      '218.32.65.98',
      // NTT
      '61.200.83.82',
      // PCCW
      '207.226.152.106',
      // HGC
      '218.189.24.82',
      // 加入localhost, ::1, 192.168.0.100
      '127.0.0.1',
      '::1',
      '192.168.0.100',
    ];
    
    // 檢查 IP 是否在白名單中
    if (!whitelist.includes(cleanIP)) {
      console.log(`🚫 訪問被拒絕 - IP: ${cleanIP}`);
      
      // 讀取 HTML 模板
      const htmlPath = path.join(__dirname, '..', 'public', 'access-denied.html');
      let htmlContent = '';
      
        htmlContent = getFallbackHTML(cleanIP);
      
      // 替換模板變數
      const timestamp = new Date().toLocaleString('zh-TW', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      
      htmlContent = htmlContent
        .replace(/{{CLIENT_IP}}/g, cleanIP)
        .replace(/{{TIMESTAMP}}/g, timestamp);
      
      return res.status(403).send(htmlContent);
    }
    
    // IP 在白名單中，繼續處理請求
    console.log(`✅ 允許訪問 - IP: ${cleanIP}`);
    next();
    
  } catch (error) {
    console.error('❌ IP 白名單檢查錯誤:', error);
    // 發生錯誤時，為了安全起見，拒絕訪問
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>系統錯誤</title></head>
        <body>
          <h1>系統錯誤</h1>
          <p>IP 檢查服務暫時無法使用，請稍後再試。</p>
        </body>
      </html>
    `);
  }
};

// 備用 HTML 內容（當檔案讀取失敗時使用）
function getFallbackHTML(clientIP) {
  const timestamp = new Date().toLocaleString('zh-TW');
  
  return `
    <!DOCTYPE html>
    <html lang="zh-TW">
      <head>
        <meta charset="utf-8">
        <title>🚫 訪問被拒絕</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #dc2626; font-size: 24px; margin: 20px 0; }
          .info { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>🚫 訪問被拒絕</h1>
        <p>您的 IP 地址不在允許訪問的白名單中。</p>
        <div class="info">
          <strong>您的 IP：</strong> ${clientIP}<br>
          <strong>時間：</strong> ${timestamp}
        </div>
        <p>如需協助，請聯繫管理員。</p>
      </body>
    </html>
  `;
}

module.exports = ipWhitelist;
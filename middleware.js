// middleware.js（放在專案根目錄）
import { NextResponse } from 'next/server';

export function middleware(request) {
    // 獲取客戶端 IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown';
    
    // 清理 IP 格式
    const cleanIP = clientIP.replace(/^::ffff:/, '').split(',')[0].trim();
    
    // 白名單 IP 列表（您提供的 IP）
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
      '218.189.24.82'
    ];
    
    // 檢查 IP 是否在白名單中
    if (!whitelist.includes(cleanIP)) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="zh-TW">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>🚫 訪問被拒絕 - 二手交換平台</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
              }
              
              .container {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                padding: 40px;
                max-width: 500px;
                width: 100%;
                text-align: center;
              }
              
              .icon {
                width: 80px;
                height: 80px;
                background: #ef4444;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                font-size: 40px;
              }
              
              h1 {
                color: #1f2937;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 16px;
              }
              
              .message {
                color: #6b7280;
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 24px;
              }
              
              .ip-info {
                background: #f3f4f6;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
                font-family: 'Courier New', monospace;
              }
              
              .ip-address {
                color: #dc2626;
                font-weight: 600;
                font-size: 18px;
              }
              
              .retry-btn {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              
              .retry-btn:hover {
                background: #2563eb;
              }
              
              .footer {
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
                color: #9ca3af;
                font-size: 14px;
              }
              
              .whitelist-info {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 16px;
                margin-top: 16px;
                font-size: 14px;
                color: #0369a1;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">🚫</div>
              <h1>訪問被拒絕</h1>
              <div class="message">
                很抱歉，您的 IP 地址不在允許訪問的白名單中。
                請使用公司網路或VPN訪問。
              </div>
              
              <div class="ip-info">
                <div>您的 IP 地址：</div>
                <div class="ip-address">${cleanIP}</div>
              </div>
              
              <button class="retry-btn" onclick="window.location.reload()">
                重新檢查
              </button>
              
              <div class="footer">
                <div>時間：${new Date().toLocaleString('zh-TW', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit',
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}</div>
              </div>
            </div>
          </body>
        </html>
      `, {
        status: 403,
        statusText: 'Forbidden',
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-cache, no-store, must-revalidate'
        }
      });
    }
    
    // IP 在白名單中，繼續處理請求
    console.log(`✅ 允許訪問 - IP: ${cleanIP}`);
    return NextResponse.next();
  }
  
  // 設定匹配的路徑（排除 API 路由和靜態檔案）
  export const config = {
    matcher: [
      /*
       * 匹配所有路徑除了：
       * - api 路由
       * - 靜態檔案
       * - _next 內部檔案
       * - favicon 等
       */
      '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
    ],
  }
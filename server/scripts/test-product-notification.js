const { sendProductListingNotification } = require('../services/emailService');

// 測試商品上架通知郵件
async function testProductNotification() {
  console.log('🧪 開始測試商品上架通知郵件...');
  
  // 模擬商品資料
  const testProduct = {
    id: 999,
    title: '測試商品 - iPhone 15 Pro Max',
    description: '這是一個測試商品，用於驗證商品上架通知郵件功能。商品狀況良好，配件齊全。',
    price: 35000,
    category: '電子產品',
    trade_type: 'sale',
    images: [
      '/uploads/products/test-image-1.jpg',
      '/uploads/products/test-image-2.jpg',
      '/uploads/products/test-image-3.jpg'
    ],
    created_at: new Date().toISOString()
  };
  
  // 模擬賣家資料
  const testSeller = {
    name: '測試賣家',
    telegram: 'test_seller'
  };
  
  try {
    const result = await sendProductListingNotification(testProduct, testSeller);
    
    if (result.success) {
      console.log('✅ 測試成功！商品上架通知郵件已發送');
      console.log(`📧 郵件 ID: ${result.messageId}`);
    } else {
      console.log('❌ 測試失敗！');
      console.log(`錯誤訊息: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  testProductNotification()
    .then(() => {
      console.log('🏁 測試完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 測試失敗:', error);
      process.exit(1);
    });
}

module.exports = { testProductNotification };

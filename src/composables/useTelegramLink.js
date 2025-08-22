import { TradeType } from '@/ts/index.enums'

export const getTelegramLink = (telegramUsername, product) => {
    const baseUrl = 'https://t.me/'
    
    // 根据交易类型生成不同的消息模板
    let message = ''
    
    if (product.trade_type === TradeType.Sale) {
      message = `您好！我對您的商品很感興趣 😊\n\n` +
                `📦 商品名稱：${product.title}\n` +
                `💰 價格：NT$ ${product.price}\n` +
                `📝 描述：${product.description || '無描述'}\n` +
                `🔗 商品連結：${window.location.href}\n\n` +
                `請問這個商品還在嗎？可以聊聊嗎？`
    } else if (product.trade_type === TradeType.Exchange) {
      message = `您好！我對您的交換商品很感興趣 🤝\n\n` +
                `📦 商品名稱：${product.title}\n` +
                `📝 描述：${product.description || '無描述'}\n` +
                `🔗 商品連結：${window.location.href}\n\n` +
                `我有興趣交換此商品，可以聊聊嗎？`
    } else if (product.trade_type === TradeType.Gift) {
      message = `您好！我對您的免費贈送商品很感興趣 🎁\n\n` +
                `📦 商品名稱：${product.title}\n` +
                `📝 描述：${product.description || '無描述'}\n` +
                `🔗 商品連結：${window.location.href}\n\n` +
                `請問這個商品還在嗎？可以聊聊嗎？`
    } else {
      message = `您好！我對您的商品很感興趣 😊\n\n` +
                `📦 商品名稱：${product.title}\n` +
                `📝 描述：${product.description || '無描述'}\n` +
                `🔗 商品連結：${window.location.href}\n\n` +
                `可以聊聊嗎？`
    }
    
    return `${baseUrl}${telegramUsername}?text=${encodeURIComponent(message)}`
  }
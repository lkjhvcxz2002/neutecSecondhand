const express = require('express');
const { body, validationResult } = require('express-validator');
const resendService = require('../services/resendService');

const router = express.Router();

// 處理 OPTIONS 預檢請求
router.options('*', (req, res) => {
  console.log(`🔄 郵件測試路由 OPTIONS 預檢請求: ${req.path}`);
  res.status(200).end();
});

// 獲取 Resend 服務狀態
router.get('/status', (req, res) => {
  try {
    const status = resendService.getStatus();
    res.json({
      success: true,
      message: 'Resend 服務狀態',
      data: status
    });
  } catch (error) {
    console.error('❌ 獲取服務狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取服務狀態失敗',
      error: error.message
    });
  }
});

// 發送測試郵件
router.post('/send-test', [
  body('email').isEmail().normalizeEmail().withMessage('請提供有效的郵箱地址'),
  body('subject').optional().trim().isLength({ min: 1, max: 100 }).withMessage('主題長度應在 1-100 字元之間')
], async (req, res) => {
  try {
    // 驗證輸入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入資料驗證失敗',
        errors: errors.array()
      });
    }

    const { email, subject } = req.body;
    const emailSubject = subject || 'Resend 測試郵件';

    console.log(`📧 開始發送測試郵件到: ${email}`);

    // 發送測試郵件
    const result = await resendService.sendTestEmail(email, emailSubject);

    console.log(`✅ 測試郵件發送成功: ${result.messageId}`);

    res.json({
      success: true,
      message: '測試郵件發送成功',
      data: {
        messageId: result.messageId,
        to: email,
        subject: emailSubject,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 測試郵件發送失敗:', error);
    res.status(500).json({
      success: false,
      message: '測試郵件發送失敗',
      error: error.message
    });
  }
});

// 發送歡迎郵件（測試用）
router.post('/send-welcome', [
  body('email').isEmail().normalizeEmail().withMessage('請提供有效的郵箱地址'),
  body('userName').trim().isLength({ min: 1, max: 50 }).withMessage('用戶名長度應在 1-50 字元之間')
], async (req, res) => {
  try {
    // 驗證輸入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入資料驗證失敗',
        errors: errors.array()
      });
    }

    const { email, userName } = req.body;

    console.log(`📧 開始發送歡迎郵件到: ${email}, 用戶: ${userName}`);

    // 發送歡迎郵件
    const result = await resendService.sendWelcomeEmail(email, userName);

    console.log(`✅ 歡迎郵件發送成功: ${result.messageId}`);

    res.json({
      success: true,
      message: '歡迎郵件發送成功',
      data: {
        messageId: result.messageId,
        to: email,
        userName: userName,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 歡迎郵件發送失敗:', error);
    res.status(500).json({
      success: false,
      message: '歡迎郵件發送失敗',
      error: error.message
    });
  }
});

// 發送密碼重設郵件（測試用）
router.post('/send-reset', [
  body('email').isEmail().normalizeEmail().withMessage('請提供有效的郵箱地址'),
  body('resetToken').trim().isLength({ min: 10 }).withMessage('重設令牌長度應至少 10 字元'),
  body('resetUrl').isURL().withMessage('請提供有效的重設連結')
], async (req, res) => {
  try {
    // 驗證輸入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入資料驗證失敗',
        errors: errors.array()
      });
    }

    const { email, resetToken, resetUrl } = req.body;

    console.log(`📧 開始發送密碼重設郵件到: ${email}`);

    // 發送密碼重設郵件
    const result = await resendService.sendPasswordResetEmail(email, resetToken, resetUrl);

    console.log(`✅ 密碼重設郵件發送成功: ${result.messageId}`);

    res.json({
      success: true,
      message: '密碼重設郵件發送成功',
      data: {
        messageId: result.messageId,
        to: email,
        resetToken: resetToken,
        resetUrl: resetUrl,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 密碼重設郵件發送失敗:', error);
    res.status(500).json({
      success: false,
      message: '密碼重設郵件發送失敗',
      error: error.message
    });
  }
});

// 批量發送測試郵件（用於測試多個郵箱）
router.post('/send-batch-test', [
  body('emails').isArray({ min: 1, max: 10 }).withMessage('郵箱列表應包含 1-10 個郵箱'),
  body('emails.*').isEmail().normalizeEmail().withMessage('請提供有效的郵箱地址'),
  body('subject').optional().trim().isLength({ min: 1, max: 100 }).withMessage('主題長度應在 1-100 字元之間')
], async (req, res) => {
  try {
    // 驗證輸入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入資料驗證失敗',
        errors: errors.array()
      });
    }

    const { emails, subject } = req.body;
    const emailSubject = subject || 'Resend 批量測試郵件';

    console.log(`📧 開始批量發送測試郵件到 ${emails.length} 個郵箱`);

    const results = [];

    // 批量發送郵件
    for (const email of emails) {
      try {
        const result = await resendService.sendTestEmail(email, emailSubject);
        results.push({
          email: email,
          success: true,
          messageId: result.messageId
        });
      } catch (error) {
        errors.push({
          email: email,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`✅ 批量郵件發送完成: ${results.length} 成功, ${errors.length} 失敗`);

    res.json({
      success: true,
      message: '批量郵件發送完成',
      data: {
        total: emails.length,
        successful: results.length,
        failed: errors.length,
        results: results,
        errors: errors,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 批量郵件發送失敗:', error);
    res.status(500).json({
      success: false,
      message: '批量郵件發送失敗',
      error: error.message
    });
  }
});

module.exports = router;

const API_BASE = '/api/email-test';

// 檢查服務狀態
async function checkStatus() {
  try {
    const response = await fetch(`${API_BASE}/status`);
    const data = await response.json();

    const statusDiv = document.getElementById('status');
    if (data.success) {
      const status = data.data;
      statusDiv.innerHTML = `
        <strong>服務狀態：</strong><br>
        ✅ 已初始化: ${status.isInitialized ? '是' : '否'}<br>
        🔑 API 金鑰: ${status.hasApiKey ? '已設定' : '未設定'}<br>
        📧 發件人: ${status.fromEmail}
      `;
      statusDiv.className = 'status success';
    } else {
      statusDiv.innerHTML = `❌ 狀態檢查失敗: ${data.message}`;
      statusDiv.className = 'status error';
    }
  } catch (error) {
    document.getElementById('status').innerHTML = `❌ 無法連接到服務: ${error.message}`;
    document.getElementById('status').className = 'status error';
  }
}

// 發送測試郵件
document.getElementById('testForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    email: formData.get('email'),
    subject: formData.get('subject')
  };

  await sendRequest('/send-test', data, '測試郵件');
});

// 發送歡迎郵件
document.getElementById('welcomeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    email: formData.get('email'),
    userName: formData.get('userName')
  };

  await sendRequest('/send-welcome', data, '歡迎郵件');
});

// 發送密碼重設郵件
document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    email: formData.get('email'),
    resetToken: formData.get('resetToken'),
    resetUrl: formData.get('resetUrl')
  };

  await sendRequest('/send-reset', data, '密碼重設郵件');
});

// 批量發送測試郵件
document.getElementById('batchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const emails = Array.from(formData.getAll('emails[]')).filter(email => email.trim());
  const data = {
    emails: emails,
    subject: formData.get('subject')
  };

  await sendRequest('/send-batch-test', data, '批量測試郵件');
});

// 發送請求的通用函數
async function sendRequest(endpoint, data, description) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `🔄 正在發送${description}...`;
  resultDiv.className = 'result info';

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      resultDiv.innerHTML = `✅ ${description}發送成功！\n\n${JSON.stringify(result.data, null, 2)}`;
      resultDiv.className = 'result success';
    } else {
      resultDiv.innerHTML = `❌ ${description}發送失敗：${result.message}`;
      resultDiv.className = 'result error';
    }
  } catch (error) {
    resultDiv.innerHTML = `❌ 請求失敗：${error.message}`;
    resultDiv.className = 'result error';
  }
}

// 添加郵箱欄位
function addEmailField() {
  const emailList = document.getElementById('emailList');
  const newField = document.createElement('div');
  newField.className = 'batch-input';
  newField.innerHTML = `
    <input type="email" name="emails[]" required placeholder="example@email.com">
    <button type="button" class="remove-email" onclick="removeEmailField(this)">移除</button>
  `;
  emailList.appendChild(newField);
}

// 移除郵箱欄位
function removeEmailField(button) {
  button.parentElement.remove();
}

// 頁面載入時檢查狀態
window.addEventListener('load', checkStatus);

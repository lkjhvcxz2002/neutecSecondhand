Write-Host "啟動開發環境..." -ForegroundColor Green
$env:NODE_ENV = "development"
node server.js

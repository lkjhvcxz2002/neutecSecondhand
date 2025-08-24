Write-Host "啟動生產環境..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
node server.js

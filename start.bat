@echo off
echo 啟動二手交換平台...

echo.
echo 啟動後端服務...
start "後端服務" cmd /k "cd server && npm run dev"

echo.
echo 等待後端啟動...
timeout /t 5 /nobreak > nul

echo.
echo 啟動前端服務...
start "前端服務" cmd /k "npm run dev"

echo.
echo 服務啟動中...
echo 後端: http://localhost:5000
echo 前端: http://localhost:3000
echo.
echo 按任意鍵關閉此視窗...
pause > nul

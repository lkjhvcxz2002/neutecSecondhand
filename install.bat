@echo off
echo 正在安裝二手交換平台依賴...

echo.
echo 安裝前端依賴...
call npm install

echo.
echo 安裝後端依賴...
cd server
call npm install
cd ..

echo.
echo 建立必要的目錄...
if not exist "server\uploads\avatars" mkdir "server\uploads\avatars"
if not exist "server\uploads\products" mkdir "server\uploads\products"

echo.
echo 建立環境變數檔案...
echo NODE_ENV=development > server\.env
echo PORT=5000 >> server\.env
echo JWT_SECRET=second-hand-platform-secret-key-2024 >> server\.env

echo.
echo 安裝完成！
echo.
echo 請按照以下步驟啟動專案：
echo 1. 啟動後端：cd server ^& npm run dev
echo 2. 啟動前端：npm run dev
echo.
echo 預設管理員帳號：
echo Email: admin@company.com
echo Password: admin123
echo.
pause

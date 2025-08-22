#!/bin/bash

echo "正在安裝二手交換平台依賴..."

echo
echo "安裝前端依賴..."
npm install

echo
echo "安裝後端依賴..."
cd server
npm install
cd ..

echo
echo "建立必要的目錄..."
mkdir -p server/uploads/avatars
mkdir -p server/uploads/products

echo
echo "建立環境變數檔案..."
cat > server/.env << EOF
NODE_ENV=development
PORT=5000
JWT_SECRET=second-hand-platform-secret-key-2024
EOF

echo
echo "安裝完成！"
echo
echo "請按照以下步驟啟動專案："
echo "1. 啟動後端：cd server && npm run dev"
echo "2. 啟動前端：npm run dev"
echo
echo "預設管理員帳號："
echo "Email: admin@company.com"
echo "Password: admin123"
echo

#!/bin/bash

# 設定變數
PROJECT_ID="your-google-cloud-project-id"
SERVICE_NAME="mail-service"
REGION="asia-east1"

echo "🚀 開始部署 Mail Service 到 Google Cloud Run..."

# 檢查 gcloud 是否已安裝
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI 未安裝，請先安裝 Google Cloud CLI"
    exit 1
fi

# 設定專案
echo "📋 設定 Google Cloud 專案: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# 啟用必要的 API
echo "🔧 啟用必要的 API..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 建立並部署服務
echo "🏗️ 建立並部署 Mail Service..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --concurrency 80

# 獲取服務 URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "✅ Mail Service 部署完成！"
echo "🌐 服務 URL: $SERVICE_URL"
echo "📧 健康檢查: $SERVICE_URL/health"
echo "📊 狀態檢查: $SERVICE_URL/status"
echo ""
echo "📝 使用方式:"
echo "POST $SERVICE_URL/send"
echo "POST $SERVICE_URL/send-batch"

#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "════════════════════════════════════════"
echo " 🏸  MX Sports 构建 + 发布"
echo "════════════════════════════════════════"

echo ""
echo "▶ Step 1/3  版本号递增..."
node deploy/bump.js

echo ""
echo "▶ Step 2/3  构建微信小程序..."
cd frontend && npm run build:mp-weixin
cd ..

echo ""
echo "▶ Step 3/3  上传预览 + 发二维码..."
node deploy/preview.js --no-build

echo ""
echo "════════════════════════════════════════"
echo " ✅  完成！查看 Telegram 中的二维码"
echo "════════════════════════════════════════"

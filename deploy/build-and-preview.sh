#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "════════════════════════════════════════"
echo " 🏸  羽毛球小程序 构建 + 预览"
echo "════════════════════════════════════════"

# 1. 构建微信小程序
echo ""
echo "▶ Step 1/2  构建微信小程序..."
# 如果有 uni-app CLI 就用，否则提示
if command -v uni &> /dev/null; then
  uni build -p mp-weixin
elif [ -f "node_modules/.bin/uni" ]; then
  ./node_modules/.bin/uni build -p mp-weixin
else
  echo "⚠️  未检测到 uni CLI，跳过构建步骤（使用已有构建产物）"
fi

# 2. 上传预览
echo ""
echo "▶ Step 2/2  上传预览并生成二维码..."
node deploy/preview.js

echo ""
echo "════════════════════════════════════════"
echo " ✅  完成！查看 Telegram 中的二维码"
echo "════════════════════════════════════════"

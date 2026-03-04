# MX Sports — 构建与发布

## 目录结构

```
/data/mxsports/
├── frontend/   UniApp 源码（Vue 3 + Vite）
├── backend/    Django API
├── deploy/     构建脚本 + 微信私钥
└── web/        H5 构建产物（自动生成，勿手动修改）
```

---

## 微信小程序

### 一键构建 + 预览（推荐）

```bash
# 步骤 1：构建
cd /data/mxsports/frontend
npm run build:mp-weixin

# 步骤 2：上传预览 + 发二维码到 Telegram
cd /data/mxsports/deploy
node preview.js --no-build
```

> 预览二维码会自动发到 Telegram，用微信扫码即可体验（24小时有效）

### 说明
- 每次执行会自动递增版本号（VERSION 文件）
- 构建产物在 `frontend/dist/build/mp-weixin/`
- 私钥在 `deploy/private.wx686427f3488d40ab.key`（勿提交 Git）

---

## Web 版（mxsports.vip）

```bash
# 构建 H5
cd /data/mxsports/frontend
npm run build:h5

# 替换线上静态文件
rm -rf /data/mxsports/web
cp -r /data/mxsports/frontend/dist/build/h5 /data/mxsports/web
```

> Django 自动 serve web/ 目录，复制完立即生效，无需重启

---

## 后端（Django）

```bash
cd /data/mxsports/backend

# 启动
nohup .venv/bin/python manage.py runserver 0.0.0.0:8001 >> server.log 2>&1 &

# 停止
pkill -f "manage.py runserver"

# 数据库迁移
.venv/bin/python manage.py migrate

# 重新导入球拍数据
.venv/bin/python manage.py seed_rackets
```

---

## API 地址

- 生产：`https://mxsports.vip/api`
- 本地：`http://localhost:8001/api`

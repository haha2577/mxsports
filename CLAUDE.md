# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MX Sports — a badminton and tennis event management platform. Targets WeChat mini-program (primary) and H5 web. Currently in Phase 1 (tool stage): match creation, registration, draw generation, score recording.

## Repository Layout

```
backend/    Django 6 + DRF API server (also hosts the H5 SPA)
frontend/   UniApp (Vue3 + Vite) cross-platform source
web/        Built H5 output — served statically by Django
deploy/     WeChat miniprogram CI scripts (miniprogram-ci)
```

## Common Commands

### Backend (run from `backend/`)

```bash
# Start dev server
python manage.py runserver

# Production restart (port 8001, daemonized, auto-migrates)
./restart.sh

# Migrations
python manage.py makemigrations
python manage.py migrate

# Run tests
python manage.py test
python manage.py test users       # single app
python manage.py test matches
python manage.py test registrations
```

Swagger UI: `http://localhost:8001/api/docs/`
Backend must use the venv at `backend/.venv/`; env vars loaded from `backend/.env`.

> `seed_rackets` management command（在 BUILD.md 中提及）目前尚未实现。

### Frontend (run from `frontend/`)

```bash
npm run dev:mp-weixin   # WeChat miniprogram dev (watch mode)
npm run dev:h5          # H5 web dev server
npm run build:mp-weixin # Build WeChat miniprogram → frontend/dist/build/mp-weixin/
npm run build:h5        # Build H5 → frontend/dist/build/h5/ (copy output to web/)
```

### Deploy WeChat Miniprogram (run from repo root)

```bash
# 构建 + 上传预览 + 发二维码到 Telegram（一步完成）
node deploy/preview.js

# 或用 shell 包装脚本
./deploy/build-and-preview.sh
```

`preview.js` 内部会调用 `npm run build:mp-weixin`，**不支持跳过构建**（BUILD.md 里写的 `--no-build` 参数实际未实现）。
每次执行自动递增 `deploy/VERSION` 的 patch 版本号。
需要 `deploy/.env` 中配置 `TG_TOKEN` 和 `TG_CHAT`。

### Deploy H5 Web（mxsports.vip）

```bash
# 构建
cd frontend && npm run build:h5

# 替换线上静态文件（Django 自动 serve，无需重启）
rm -rf web
cp -r frontend/dist/build/h5 web
```

## Architecture

### How frontend and backend connect

- **WeChat miniprogram**: The UniApp source in `frontend/` is compiled to `frontend/dist/build/mp-weixin/`. The mini-program calls `https://mxsports.vip/api` directly.
- **H5 web**: The UniApp H5 build output goes to `web/`. Django serves the SPA at all non-`/api/` routes via `backend/web_views.py`; assets at `assets/` and `static/` are served from `web/` as well.
- **API base URL** is hardcoded in `frontend/src/api/index.js` as `https://mxsports.vip/api`.

### Request flow (H5)

Browser → Django (port 8001) → `web_views.index` serves `web/index.html` for all non-API paths → UniApp SPA bootstraps → calls `/api/...` endpoints.

### Authentication

JWT stored in `uni.storage` under key `token`. Sent as `Authorization: Bearer <token>`. On 401, token and userInfo are cleared from storage. See `backend/CLAUDE.md` for full auth details including dev mode shortcuts.

### Frontend page structure

Pages are declared in `frontend/src/pages.json`. Tab bar has two entries: Home and Profile. Sport-specific index pages (`badminton/`, `tennis/`) have distinct color themes (green / orange).

### i18n

`vue-i18n` with locale files in `frontend/src/locales/` (zh.js, en.js). Language can be changed via `pages/settings/language`.

## Detailed Backend Docs

`backend/CLAUDE.md` contains full details on: app structure, auth flow, authorization pattern, tournament draw algorithms, response format (`ok()`/`err()`), and how to add new endpoints.

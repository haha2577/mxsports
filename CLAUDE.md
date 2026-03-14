# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MX Sports (铭心乐Go) — a badminton and tennis event management platform. Primary target is WeChat mini-program; H5 web is secondary. Currently in Phase 1 (tool stage): match creation, registration, draw generation, score recording, AI chat assistant.

## Repository Layout

```
miniprogram/  Native WeChat miniprogram (WXML/WXSS/JS, no framework)
backend/      Django 6 + DRF API server (also hosts the H5 SPA)
frontend/     UniApp (Vue3 + Vite) — legacy/alternate frontend, may not be present
web/          Built H5 output — served statically by Django
deploy/       WeChat miniprogram CI scripts (miniprogram-ci)
```

**Important:** The active miniprogram frontend is `miniprogram/` (native WeChat), not `frontend/` (UniApp). The `frontend/` directory may not exist in the current checkout.

## Common Commands

### Backend (run from `backend/`)

```bash
# Activate venv first
source .venv/bin/activate

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

# Seed racket data
python manage.py seed_rackets
```

Swagger UI: `http://localhost:8001/api/docs/`
Backend venv: `backend/.venv/`; env vars loaded from `backend/.env`.

### Miniprogram Development

Open `miniprogram/` in WeChat Developer Tools. No build step — source is deployed directly.

To use local backend, set `miniprogram/utils/env.js`:
```js
module.exports = { API_BASE: 'http://localhost:8001/api' }
```
This file is gitignored. Production fallback is `https://mxsports.vip/api`.

### Deploy WeChat Miniprogram (run from repo root)

```bash
node deploy/preview.js    # Build + upload preview + send QR to Telegram
node deploy/upload.js     # Upload as experience version (15-person whitelist)
```

`preview.js` auto-increments `miniprogram/version.json` patch version and temporarily switches `env.js` to production during upload. Requires `deploy/.env` with `TG_TOKEN` and `TG_CHAT`.

### Deploy H5 Web (mxsports.vip)

```bash
cd frontend && npm run build:h5
rm -rf web && cp -r frontend/dist/build/h5 web
# Django auto-serves web/ — no restart needed
```

## Architecture

### Backend (Django)

**Stack:** Django 6.0.2 + DRF + SQLite (`mxsports.db`)

**Apps:**
- `users/` — Custom user model (not Django AbstractUser), JWT auth, WeChat + SMS login
- `matches/` — Match/tournament CRUD, draw generation, score recording, leaderboard
- `registrations/` — Player registration with pending/approved/rejected workflow
- `rackets/` — Sports equipment database with filtering
- `venues/` — Venue listings with location-based search
- `news/` — Articles filtered by sport and geography
- `ai_chat/` — Streaming AI chat via MiniMax-Text-01 (SSE format)

**Critical patterns:**
- Auth uses custom JWT middleware (`users/middleware.py`) that sets `request.user_obj` — NOT `request.user`
- All API responses use `ok(data, message)` / `err(message, status)` returning `{code: 0/-1, data, message}`
- Organizer auth check: `match.organizer_id != user.id and not user.is_organizer`

**Draw algorithms** (`matches/views.py`): `round_robin`, `knockout` (elimination bracket with byes), `group` (groups of N, round-robin within), `rotation_doubles` (pair into teams, teams round-robin).

**Environment variables** (`.env`): `SECRET_KEY`, `DEBUG`, `WX_APPID`, `WX_SECRET`, `MINIMAX_API_KEY`

**Logging:** `backend/server.log` (general), `backend/.log/ai_chat.log` (AI requests)

### Miniprogram (Native WeChat)

**Global components** (registered in `app.json`, available everywhere):
- `nav-bar` — Custom nav bar (required on all pages since `navigationStyle: custom`)
- `sport-switcher` — Badminton/tennis toggle
- `login-sheet` — Bottom-sheet handling WeChat OAuth + SMS login + profile setup
- `sport-pref-sheet` — First-time sport preference picker

**Sport theming:** `utils/sport-config.js` is the single source of truth. Use `applySport(this)` in `onShow` for tab pages, `switchSport(page, e)` for toggle events.

**Storage keys:** `token` (JWT), `userInfo` (cached user), `activeSport` ('badminton'/'tennis'), `canSwitch` (boolean)

**Tab bar:** Home | AI | Profile (3 tabs)

### How frontend and backend connect

- **Miniprogram**: Calls `https://mxsports.vip/api` directly (or localhost in dev via `env.js`)
- **H5 web**: Django serves `web/index.html` for all non-`/api/` routes via `backend/web_views.py`

### Authentication

Two login methods:
1. **WeChat:** Client sends `code` → server exchanges for `openid` → JWT issued
2. **Phone/SMS:** Request SMS code → submit phone + code → JWT issued

Dev mode (`DEBUG=True`): WeChat login creates `dev_<code>` openid; SMS codes print to stdout.

JWT stored in `wx.storage` under key `token`, sent as `Authorization: Bearer <token>`.

## Detailed Subsystem Docs

- `backend/CLAUDE.md` — Backend auth flow, authorization, draw algorithms, adding endpoints
- `miniprogram/CLAUDE.md` — Miniprogram components, state management, page conventions

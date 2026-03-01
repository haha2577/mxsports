# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MX Sports — a Chinese-language badminton event management platform built with Django REST Framework. Backend for a WeChat mini-program supporting event creation, player registration, and tournament management.

## Common Commands

```bash
# Development server
python manage.py runserver

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Run all tests
python manage.py test

# Run tests for a specific app
python manage.py test users
python manage.py test matches
python manage.py test registrations

# Create superuser for Django admin
python manage.py createsuperuser
```

API docs (Swagger UI) available at `/api/docs/` when server is running.

## Architecture

**Stack:** Django 6.0.2 + Django REST Framework + SQLite (`mxsports.db`)

**Apps:**
- `users/` — Custom user model (no Django auth user), JWT auth, WeChat mini-program login, SMS phone login
- `matches/` — Match/tournament CRUD, draw generation algorithms, score recording
- `registrations/` — Player registration with pending/approved/rejected workflow
- `config/` — Django project settings, root URL config

**Key architectural decisions:**
- No Django `AbstractUser` — the `User` model in `users/models.py` is entirely custom, identified by `openid` (WeChat) or phone-based prefix
- JWT auth is handled by **custom middleware** (`users/middleware.py`) that sets `request.user_obj` — views access the authenticated user via `request.user_obj`, not `request.user`
- DRF's `IsAuthenticated` permission checks `request.user` (Django's built-in), while business logic checks `request.user_obj` — these are separate concerns
- All API responses use two helper functions defined in each views.py: `ok(data, message)` and `err(message, status)` returning `{code: 0/−1, data, message}`

## Authentication Flow

Two login methods:
1. **WeChat:** Client sends WeChat `code` → server exchanges with WeChat API for `openid` → create/find User → issue JWT
2. **Phone/SMS:** Client requests SMS code (cached in-memory 5 min) → submits phone + code → create/find User → issue JWT

**Dev mode shortcuts** (when `DEBUG=True`):
- WeChat login with any code creates openid `dev_<code>` without calling WeChat API
- SMS codes are printed to stdout instead of sent

## Authorization Pattern

Organizer-only actions (generate draw, update scores, edit match) check:
```python
if match.organizer_id != user.id and not user.is_organizer:
    return err('无权操作', 403)
```
The `is_organizer` flag on User grants superadmin-like access to all matches.

## Tournament Draw Algorithms (matches/views.py)

Three draw types, all consuming a list of approved `Registration` users:
- `round_robin` — every player vs every other player, all in `round_num=1`
- `knockout` — random shuffle, elimination bracket across multiple rounds; odd players get a bye (auto `finished` game)
- `group` — random shuffle into groups of `group_size`, round-robin within each group

Draw generation deletes all existing games for the match and sets match status to `ongoing`.

## Environment Variables

Loaded from `.env` at project root:
- `SECRET_KEY` — Django secret key
- `DEBUG` — `True`/`False`
- `WX_APPID`, `WX_SECRET` — WeChat mini-program credentials

`WX_APPID` is hardcoded in `settings.py`; `WX_SECRET` comes from env.

## Adding New Endpoints

Follow the existing pattern:
1. Add view class in `<app>/views.py` using `APIView`, returning `ok()`/`err()`
2. Add URL in `<app>/urls.py`
3. Set `permission_classes` or override `get_permissions()` per method
4. Access authenticated user via `request.user_obj` (may be `None` for unauthenticated requests)

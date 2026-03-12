# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the **native WeChat miniprogram** for MX Sports — a badminton/tennis event management platform. It is written in vanilla WXML/WXSS/JS (no UniApp, no framework). App ID: `wx686427f3488d40ab`.

There is a separate UniApp-based frontend at `../frontend/` that targets both WeChat and H5. This directory is the standalone native miniprogram version.

## Development

Open the `miniprogram/` directory in WeChat Developer Tools. The project uses `navigationStyle: custom` globally, so every page must include the `<nav-bar>` component.

To point at the local backend instead of production, ensure `utils/env.js` contains:
```js
module.exports = { API_BASE: 'http://localhost:8001/api' }
```
Note: this file is required via `require('./env.js')`, so it must be valid JS — not dotenv format.
The production API base is `https://mxsports.vip/api`. `utils/api.js` reads `utils/env.js` at runtime and falls back to production if the file is missing or empty.

There is no build step — the source is deployed directly via WeChat Developer Tools upload or the deploy scripts at `../deploy/`.

## Architecture

### Global State (wx.storage)

| Key | Description |
|-----|-------------|
| `token` | JWT Bearer token — sent as `Authorization: Bearer <token>` |
| `userInfo` | Cached user object from server |
| `activeSport` | Current sport: `'badminton'` or `'tennis'` |
| `canSwitch` | Boolean — true only for `sportPref === 'both'` users |

`app.js` initializes `activeSport` and `canSwitch` from `userInfo` on launch. `getApp().globalData` mirrors `token` and `userInfo`.

### Sport System

`utils/sport-config.js` is the single source of truth for sport-specific visuals and copy. Use these functions in every sport-aware page:

- `applySport(page, overrideSport?)` — reads `activeSport` from storage and calls `setData` with sport theme data; call in `onShow`
- `switchSport(page, e, callback?)` — handles the sport-switcher `switch` event, persists to storage, updates page data, fires optional callback
- `getSportData(sport)` — returns the `setData`-compatible data object without side effects
- `getSportConfig(sport)` — returns the raw config object (grad, primary, label, emoji, features, etc.)

`utils/theme.js` is a backward-compatibility shim — new code should use `sport-config.js` directly.

### API (`utils/api.js`)

All endpoints are defined as named methods on the `api` object. The `request(method, url, data)` helper attaches the JWT from storage automatically. Errors reject with the raw `wx.request` response object; callers extract `e.data.message` or `e.data.detail` for user-facing messages.

### Global Components (registered in `app.json`)

All four are available in every page without local registration:

- **`nav-bar`** — custom nav bar required on all non-tab pages. Measures status bar height via `wx.getMenuButtonBoundingClientRect`. Props: `title`, `back` (Boolean, default true), `background`. Fires `height` event with `{ height }` so pages can offset scroll containers.
- **`sport-switcher`** — badminton/tennis toggle pill. Props: `active`, `canSwitch`. Fires `switch` event with sport string. Only render when `canSwitch` is true.
- **`login-sheet`** — bottom-sheet login. Props: `visible`. Fires `success` (with userInfo) and `close`. Handles WeChat OAuth, SMS code login, and new-user profile setup in one flow.
- **`sport-pref-sheet`** — first-time sport preference picker. Props: `visible`. Fires `confirm` with `{ pref, activeSport, canSwitch }` and syncs to server automatically.

### Auth Flow

1. User taps login → page sets `showLogin: true`
2. `login-sheet` handles everything: calls `wx.login` (WeChat) or SMS endpoints
3. On success: stores `token`, `userInfo`, `activeSport`, `canSwitch` in storage; fires `success` event with `userInfo`
4. If `userInfo.isNew === true`, sheet shows profile setup step (avatar + nickname) before firing `success`
5. If `userInfo.sportPref` is unset after login, page sets `showSportPref: true` to prompt sport preference

### Page Conventions

- Tab pages (`home`, `profile`): call `applySport(this)` and refresh data in `onShow`
- Secondary pages: include `<nav-bar title="..." />` and offset content by nav height
- Match detail page receives `id` via query param; match create always defaults to `matchType: 'round_robin'`

### Utilities

- `utils/time.js` — `fmtTime(isoString)` → `"3月14日 12:04"`, `fmtDate(isoString)` → `"3月14日（周六）"`
- `version.json` — version info read by profile page via `wx.getFileSystemManager()`

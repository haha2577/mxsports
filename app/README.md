# 🏸 羽毛球赛事小程序

基于 **UniApp 3 + Vue 3 + Pinia** 开发的跨平台羽毛球赛事管理小程序。
支持微信小程序、H5、App 三端构建。

---

## ✨ 功能一览

| 模块 | 功能 |
|------|------|
| 🔐 登录 | 微信一键授权，Token 持久化，登录守卫 |
| 🏠 首页 | Banner、四格快捷入口、我的报名横滑、最新赛事列表 |
| 📋 赛事报名 | 状态筛选、上拉加载、弹窗确认报名/取消 |
| ➕ 创建赛事 | 赛制选择、人数/级别/费用/审核设置、草稿/发布 |
| ⚔️ 比赛管理 | 循环赛/淘汰赛/分组赛对阵生成、本地+同步后端 |
| 📊 比赛详情 | 对阵表、±步进记分弹窗、积分榜自动计算、胜者高亮 |
| 👤 个人中心 | 用户信息、战绩统计、退出登录 |

---

## 🗂 项目结构

```
badminton-app/
├── src/
│   ├── pages/
│   │   ├── auth/login.vue          # 微信登录页
│   │   ├── home/index.vue          # 首页
│   │   ├── register/index.vue      # 赛事报名
│   │   ├── match/
│   │   │   ├── index.vue           # 比赛管理（生成对阵）
│   │   │   ├── create.vue          # 创建赛事
│   │   │   └── detail.vue          # 比赛详情 + 记分
│   │   └── profile/index.vue       # 个人中心
│   ├── components/
│   │   ├── common/LoadingView.vue  # 通用加载/错误/空状态
│   │   └── match/MatchCard.vue     # 赛事卡片
│   ├── store/modules/
│   │   ├── user.js                 # 用户状态（登录/登出）
│   │   └── match.js                # 赛事状态（分页/错误）
│   ├── api/
│   │   ├── auth.js                 # 认证接口
│   │   ├── match.js                # 赛事接口
│   │   └── register.js             # 报名接口
│   ├── utils/
│   │   ├── request.js              # HTTP封装（重试/超时/loading）
│   │   └── util.js                 # 对阵算法 + 工具函数
│   ├── uni.scss                    # 全局 SCSS 变量
│   ├── manifest.json               # 小程序配置
│   ├── pages.json                  # 路由 + TabBar + easycom
│   ├── App.vue                     # 根组件 + 登录守卫
│   └── main.js                     # 入口
├── vite.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 快速开始

```bash
cd /data/badminton-app

# 安装依赖
npm install

# 微信小程序开发（需要微信开发者工具）
npm run dev:mp-weixin
# 打开微信开发者工具 → 导入 dist/dev/mp-weixin

# H5 本地预览
npm run dev:h5

# 构建发布包
npm run build:mp-weixin
```

---

## ⚙️ 配置项

| 文件 | 配置项 | 说明 |
|------|--------|------|
| `src/manifest.json` | `mp-weixin.appid` | 填入你的微信小程序 AppID |
| `src/utils/request.js` | `BASE_URL` | 替换为你的后端 API 地址 |

---

## 🏆 赛制算法说明

| 赛制 | 算法 | 场次 |
|------|------|------|
| 循环赛 | 两两对决 Round Robin | n×(n-1)/2 场 |
| 单淘汰 | 随机分签，逐轮淘汰 | n-1 场 |
| 分组赛 | 先分组循环再交叉淘汰 | 视分组而定 |

积分规则：胜 **3分**，负 **0分**，按积分降序排名。

---

## 📡 后端接口

所有接口定义在 `src/api/` 目录，遵循 REST 风格：

```
POST /auth/wx-login          微信登录换 token
GET  /matches                赛事列表（分页）
POST /matches                创建赛事
GET  /matches/:id            赛事详情
PUT  /matches/:id/games/:gid/score  更新比分
POST /matches/:id/register   报名
DELETE /matches/:id/register 取消报名
GET  /registrations/mine     我的报名
```

---

## 🔧 技术栈

- **框架**: UniApp 3.x + Vue 3 Composition API
- **状态管理**: Pinia 2
- **UI 组件库**: uni-ui（easycom 自动引入）
- **构建工具**: Vite 4
- **样式**: SCSS + 全局变量系统

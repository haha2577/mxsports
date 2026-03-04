<template>
  <view class="page" :class="themeCls">

    <!-- ① 未登录：双入口卡片 -->
    <view v-if="!token">
      <view class="topbar-unlogged" :style="`padding-top:${statusBarHeight + 8}px`">
        <text class="app-name">铭心乐Go</text>
      </view>
      <view class="hero-unlogged">
        <text class="hero-unlogged-title">选择你的运动</text>
        <text class="hero-unlogged-sub">报名参赛 · 组织比赛 · 记录成长</text>
      </view>
      <view class="sport-cards">
        <view class="sport-card badminton-card" @tap="guestEnter('badminton')">
          <text class="sc-deco">BADMINTON</text>
          <text class="sc-emoji">🏸</text>
          <text class="sc-name">羽毛球</text>
          <text class="sc-desc">轻盈快速 · 室内竞技</text>
          <view class="sc-btn"><text class="sc-btn-txt">进入 →</text></view>
        </view>
        <view class="sport-card tennis-card" @tap="guestEnter('tennis')">
          <text class="sc-deco">TENNIS</text>
          <text class="sc-emoji">🎾</text>
          <text class="sc-name">网球</text>
          <text class="sc-desc">力量技巧 · 精英对决</text>
          <view class="sc-btn sc-btn-t"><text class="sc-btn-txt sc-btn-txt-t">进入 →</text></view>
        </view>
      </view>
      <view class="guest-login-row" @tap="showLogin = true">
        <text class="guest-login-txt">已有账号？登录后记录赛事数据 ›</text>
      </view>
    </view>

    <!-- ② 已登录 -->
    <view v-else>

      <!-- Hero（含顶部导航） -->
      <view class="hero" :style="`padding-top:${statusBarHeight + 12}px`">
        <text class="hero-deco">{{ activeSport === 'badminton' ? '🏸' : '🎾' }}</text>

        <!-- 顶部行：运动切换 + 头像 -->
        <view class="hero-topbar">
          <view class="tb-left">
            <sport-switcher :active="activeSport" @switch="switchSport"/>
          </view>
          <view class="avatar-btn" @tap="goProfile">
            <image v-if="user&&user.avatar" :src="user.avatar" class="tb-avatar" mode="aspectFill"/>
            <text v-else class="tb-avatar-emoji">🙋</text>
          </view>
        </view>

        <!-- Hero 内容 -->
        <view class="hero-inner">
          <text class="hero-greeting">Hi，{{ user ? (user.nickname||'运动员') : '运动员' }} 👋</text>
          <text class="hero-title">{{ activeSport === 'badminton' ? '羽毛球赛事' : '网球赛事' }}</text>
          <text class="hero-sub">{{ activeSport === 'badminton' ? '报名、组织、记录你的每一场比赛' : '专业赛事管理，积分排名实时更新' }}</text>
        </view>
      </view>

      <!-- 功能入口 -->
      <view class="action-row">
        <view class="action-card" @tap="goRegister">
          <view class="ac-icon" :style="activeSport==='badminton' ? 'background:#e8f7ee' : 'background:#fdf0e8'">📋</view>
          <text class="ac-title">报名参赛</text>
          <text class="ac-desc">浏览并报名公开赛事</text>
        </view>
        <view class="action-card" @tap="goCreate">
          <view class="ac-icon" :style="activeSport==='badminton' ? 'background:#d0f0dc' : 'background:#fde3d0'">🏆</view>
          <text class="ac-title">创建赛事</text>
          <text class="ac-desc">组织一场属于你的比赛</text>
        </view>
      </view>

      <!-- 附近的约球 -->
      <view class="section">
        <view class="sec-hd">
          <view style="display:flex;align-items:center;gap:12rpx">
            <view class="dot" :class="activeSport==='badminton' ? 'dot-b' : 'dot-t'"/>
            <text class="sec-title">附近的约球</text>
          </view>
          <text class="sec-more" :class="activeSport==='badminton' ? 'more-b' : 'more-t'" @tap="goList">全部</text>
        </view>
        <view v-if="loading" class="empty">加载中…</view>
        <view v-else-if="!matches.length" class="empty">暂无约球活动 {{ activeSport === 'badminton' ? '🏸' : '🎾' }}</view>
        <view v-for="m in matches" :key="m.id" class="match-item" @tap="goDetail(m.id)">
          <view class="mi-icon-wrap" :class="activeSport==='badminton' ? 'mi-b' : 'mi-t'">
            <text style="font-size:30rpx">{{ activeSport === 'badminton' ? '🏸' : '🎾' }}</text>
          </view>
          <view style="flex:1">
            <text class="mi-name">{{ m.name }}</text>
            <text class="mi-info">📍{{ m.location||'—' }}{{ m.distance ? ' · '+m.distance : '' }} · {{ m.level||'不限水平' }}</text>
          </view>
          <text :class="['badge', `s-${m.status}`]">{{ statusLabel(m.status) }}</text>
        </view>
      </view>

    </view>

    <!-- 登录弹窗 -->
    <login-sheet :visible="showLogin" @close="showLogin=false" @success="onLoginSuccess"/>

    <!-- 运动偏好弹窗 -->
    <sport-pref-sheet :visible="showSportPref" @confirm="onSportPrefConfirm"/>

  </view>
</template>

<script>
import LoginSheet     from '../../components/LoginSheet.vue'
import SportSwitcher  from '../../components/SportSwitcher.vue'
import SportPrefSheet from '../../components/SportPrefSheet.vue'
import { api } from '../../api/index.js'

export default {
  components: { LoginSheet, SportPrefSheet, SportSwitcher },
  data() {
    return {
      token: '',
      user: null,
      sportPref: '',      // 'badminton' | 'tennis' | 'both'
      activeSport: 'badminton',
      matches: [],
      loading: false,
      showLogin: false,
      showSportPref: false,
      guestSport: '',     // 未登录游客临时选的运动
      statusBarHeight: 20,
    }
  },
  computed: {
    themeCls() { return this.activeSport === 'badminton' ? 'theme-b' : 'theme-t' },
    topbarStyle() {
      const pt = this.statusBarHeight + 8
      const color = this.activeSport === 'badminton' ? '#e8f7ee' : '#fde3d0'
      return `background:#fff; border-bottom:2rpx solid ${color}; padding-top:${pt}px;`
    }
  },
  onLoad() {
    try {
      const info = uni.getSystemInfoSync()
      this.statusBarHeight = info.statusBarHeight || 20
    } catch(e) {}
  },
  onShow() {
    this.token = getApp().globalData.token || ''
    this.user  = getApp().globalData.userInfo || null
    if (this.token) {
      this._initLoggedIn()
    }
  },
  methods: {
    _initLoggedIn() {
      const pref = uni.getStorageSync('sportPref')
      if (!pref) {
        // 登录后没有偏好，弹出选择
        this.showSportPref = true
        return
      }
      this.sportPref   = pref
      this.activeSport = pref === 'both'
        ? (uni.getStorageSync('activeSport') || 'badminton')
        : pref
      this.loadMatches()
    },
    switchSport(sport) {
      this.activeSport = sport
      uni.setStorageSync('activeSport', sport)
      this.loadMatches()
    },
    guestEnter(sport) {
      // 未登录游客点击入口，直接跳转对应运动页
      uni.navigateTo({ url: `/pages/${sport}/index` })
    },
    async loadMatches() {
      this.loading = true
      try {
        const r = await api.matches(`?sport=${this.activeSport}&size=5&nearby=1`)
        this.matches = r.data?.list || []
      } catch { this.matches = [] }
      this.loading = false
    },
    onLoginSuccess(userInfo) {
      this.token = getApp().globalData.token || ''
      this.user  = userInfo
      this._initLoggedIn()
    },
    onSportPrefConfirm(pref) {
      this.showSportPref = false
      this.sportPref   = pref
      this.activeSport = pref === 'both' ? 'badminton' : pref
      uni.setStorageSync('activeSport', this.activeSport)
      this.loadMatches()
      // TODO: 保存到后端 api.updateProfile({ sport_preference: pref })
    },
    goRegister() { uni.navigateTo({ url: `/pages/match/list?sport=${this.activeSport}` }) },
    goCreate() {
      if (!this.token) { this.showLogin = true; return }
      uni.navigateTo({ url: `/pages/match/create?sport=${this.activeSport}` })
    },
    goDetail(id) { uni.navigateTo({ url: `/pages/match/detail?id=${id}` }) },
    goList()   { uni.navigateTo({ url: `/pages/match/list?sport=${this.activeSport}&mode=nearby` }) },
    goProfile(){ uni.switchTab({ url: '/pages/profile/index' }) },
    statusLabel(s) { return { open:'报名中', ongoing:'进行中', finished:'已结束' }[s] || s }
  }
}
</script>

<style lang="scss">
.page {  background:#f4f5f7; padding-bottom:80rpx; }

/* ===== 未登录 ===== */
.topbar-unlogged {
  position: sticky; top: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 40rpx 20rpx;
  background: #fff;
}
.app-name   { font-size: 34rpx; font-weight: bold; color: #1a1a1a; }
.hero-unlogged {
  background: #1a1a2e; padding: 48rpx 40rpx 36rpx;
  text-align: center;
}
.hero-unlogged-title { display:block; font-size:44rpx; font-weight:bold; color:#fff; margin-bottom:10rpx; }
.hero-unlogged-sub   { font-size:26rpx; color:rgba(255,255,255,.55); }

.sport-cards { display:flex; gap:20rpx; padding:24rpx 24rpx 0; }
.sport-card {
  flex:1; border-radius:28rpx; padding:40rpx 28rpx;
  position:relative; overflow:hidden;
  box-shadow:0 10rpx 36rpx rgba(0,0,0,.14);
}
.badminton-card { background:linear-gradient(145deg,#0faa4e,#1DB954,#25d366); }
.tennis-card    { background:linear-gradient(145deg,#b5451b,#d4541f,#e8712a); }
.sc-deco  { position:absolute; top:10rpx; right:-10rpx; font-size:56rpx; font-weight:900; color:rgba(255,255,255,.08); letter-spacing:-2rpx; }
.sc-emoji { display:block; font-size:72rpx; margin-bottom:12rpx; }
.sc-name  { display:block; font-size:40rpx; font-weight:bold; color:#fff; margin-bottom:8rpx; }
.sc-desc  { display:block; font-size:22rpx; color:rgba(255,255,255,.75); margin-bottom:28rpx; }
.sc-btn   { display:inline-flex; background:rgba(255,255,255,.92); border-radius:50rpx; padding:14rpx 32rpx; }
.sc-btn-txt   { color:#1DB954; font-size:26rpx; font-weight:bold; }
.sc-btn-txt-t { color:#d4541f; }
.guest-tip { display:block; text-align:center; color:#bbb; font-size:23rpx; margin-top:24rpx; }
.guest-login-row { margin:20rpx 24rpx 0; background:#fff; border-radius:20rpx; padding:28rpx; text-align:center; box-shadow:0 4rpx 16rpx rgba(0,0,0,.05); }
.guest-login-txt { font-size:28rpx; color:#555; }

/* ===== 已登录 Hero topbar ===== */
.hero-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:32rpx; position:relative; z-index:2; }
.tb-left { flex:1; }
.st-emoji { font-size:26rpx; }
.st-label { font-size:22rpx; color:rgba(255,255,255,.9); }
.sl-emoji    { font-size:30rpx; }
.avatar-btn { width:72rpx; height:72rpx; background:rgba(255,255,255,.15); border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; border:2rpx solid rgba(255,255,255,.25); }
.tb-avatar  { width:100%; height:100%; }
.tb-avatar-emoji { font-size:40rpx; }
.hero-greeting { display:block; font-size:28rpx; color:rgba(255,255,255,.8); margin-bottom:8rpx; }

/* ===== Hero ===== */
.hero { padding:40rpx 40rpx 50rpx; position:relative; overflow:hidden; }
.hero { background: linear-gradient(145deg, #1a1a2e, #0f3460); }
.hero-deco { position:absolute; font-size:120rpx; opacity:.15; top:10rpx; right:20rpx; }
.hero-inner { position:relative; z-index:2; }
.badge-txt { display:inline-block; background:rgba(255,255,255,.2); color:rgba(255,255,255,.9); font-size:20rpx; font-weight:bold; padding:6rpx 20rpx; border-radius:50rpx; letter-spacing:4rpx; margin-bottom:16rpx; border:1rpx solid rgba(255,255,255,.3); }
.hero-title { display:block; font-size:48rpx; font-weight:bold; color:#fff; margin-bottom:10rpx; }
.hero-sub   { display:block; font-size:26rpx; color:rgba(255,255,255,.8); margin-bottom:20rpx; }
.court-lines { position:absolute; inset:0; opacity:.1; }
.hl { position:absolute; height:2rpx; left:0; right:0; background:#fff; }
.top { top:40rpx; } .mid { top:50%; }
.vl  { position:absolute; width:2rpx; top:0; bottom:0; left:50%; background:#fff; }
.score-bar { display:inline-block; background:rgba(0,0,0,.25); padding:10rpx 24rpx; border-radius:12rpx; }
.score-txt { font-size:24rpx; color:rgba(255,255,255,.9); letter-spacing:8rpx; }

/* ===== 功能入口 ===== */
.action-row { display:flex; gap:20rpx; padding:24rpx 24rpx 0; }
.action-card { flex:1; background:#fff; border-radius:24rpx; padding:30rpx 24rpx; display:flex; flex-direction:column; align-items:center; box-shadow:0 4rpx 20rpx rgba(0,0,0,.06); }
.ac-icon  { width:96rpx; height:96rpx; border-radius:24rpx; display:flex; align-items:center; justify-content:center; font-size:48rpx; margin-bottom:16rpx; }
.ac-title { font-size:32rpx; font-weight:bold; color:#1a1a1a; margin-bottom:8rpx; }
.ac-desc  { font-size:22rpx; color:#888; text-align:center; }

/* ===== 赛事列表 ===== */
.section { margin:24rpx; background:#fff; border-radius:24rpx; padding:30rpx; box-shadow:0 4rpx 20rpx rgba(0,0,0,.06); }
.sec-hd  { display:flex; justify-content:space-between; align-items:center; margin-bottom:24rpx; }
.dot { width:8rpx; height:36rpx; border-radius:4rpx; }
.dot-b { background:#1DB954; } .dot-t { background:#d4541f; }
.sec-title { font-size:32rpx; font-weight:bold; color:#1a1a1a; }
.sec-more  { font-size:26rpx; }
.more-b { color:#1DB954; } .more-t { color:#d4541f; }
.match-item { display:flex; align-items:center; padding:20rpx 0; border-bottom:1rpx solid #f5f5f5; gap:16rpx; }
.match-item:last-child { border-bottom:none; }
.mi-icon-wrap { width:60rpx; height:60rpx; border-radius:16rpx; display:flex; align-items:center; justify-content:center; }
.mi-b { background:#e8f7ee; } .mi-t { background:#fdf0e8; }
.mi-name { display:block; font-size:30rpx; font-weight:bold; color:#1a1a1a; margin-bottom:6rpx; }
.mi-info { font-size:22rpx; color:#888; }
.badge { font-size:22rpx; padding:8rpx 18rpx; border-radius:50rpx; }
.s-open     { background:#e8f7ee; color:#1DB954; }
.s-ongoing  { background:#1DB954; color:#fff; }
.s-finished { background:#f5f5f5; color:#999; }
.empty { text-align:center; padding:60rpx 0; color:#aaa; font-size:28rpx; }
</style>

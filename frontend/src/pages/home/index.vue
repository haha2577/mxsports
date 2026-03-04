<template>
  <view class="page" :class="themeCls">

    <!-- ① 首次选择运动偏好 -->
    <view v-if="!pref" class="onboard">
      <view class="ob-top">
        <text class="ob-logo">🏟️</text>
        <text class="ob-title">你主要打什么球？</text>
        <text class="ob-sub">选完之后直接进你的主场，随时可以切换</text>
      </view>
      <view class="ob-cards">
        <view class="ob-card badminton-card" @tap="setPref('badminton')">
          <text class="ob-emoji">🏸</text>
          <text class="ob-sport">羽毛球</text>
          <text class="ob-sport-en">Badminton</text>
        </view>
        <view class="ob-card tennis-card" @tap="setPref('tennis')">
          <text class="ob-emoji">🎾</text>
          <text class="ob-sport">网球</text>
          <text class="ob-sport-en">Tennis</text>
        </view>
      </view>
      <view class="ob-both" @tap="setPref('both')">
        <text class="ob-both-txt">🏸🎾 两个都打</text>
      </view>
    </view>

    <!-- ② 已有偏好：主场景 -->
    <view v-else>

      <!-- 顶部导航 -->
      <view class="topbar" :style="topbarStyle">
        <view class="tb-left">
          <!-- 单项运动：显示名称 + 切换箭头 -->
          <view v-if="pref !== 'both'" class="sport-switcher" @tap="showSwitcher = !showSwitcher">
            <text class="sw-emoji">{{ activeSport === 'badminton' ? '🏸' : '🎾' }}</text>
            <text class="sw-name">{{ activeSport === 'badminton' ? '羽毛球' : '网球' }}</text>
            <text class="sw-arrow" :class="{open: showSwitcher}">▾</text>
          </view>
          <!-- 两项都打：Tab -->
          <view v-else class="sport-tabs">
            <view :class="['st', activeSport==='badminton'&&'st-active-b']" @tap="activeSport='badminton'">🏸 羽毛球</view>
            <view :class="['st', activeSport==='tennis'&&'st-active-t']" @tap="activeSport='tennis'">🎾 网球</view>
          </view>
        </view>
        <view class="tb-right">
          <view class="avatar-btn" @tap="goProfile">
            <text class="avatar-emoji">🙋</text>
          </view>
        </view>
      </view>

      <!-- 切换下拉菜单（单项用户） -->
      <view v-if="showSwitcher && pref !== 'both'" class="switcher-drop">
        <view v-if="activeSport !== 'badminton'" class="sd-item" @tap="switchTo('badminton')">🏸 切换到羽毛球</view>
        <view v-if="activeSport !== 'tennis'" class="sd-item" @tap="switchTo('tennis')">🎾 切换到网球</view>
        <view class="sd-item sd-pref" @tap="resetPref">⚙️ 重新设置偏好</view>
      </view>
      <view v-if="showSwitcher" class="mask" @tap="showSwitcher=false"/>

      <!-- Hero 区域 -->
      <view class="hero" :class="activeSport === 'badminton' ? 'hero-b' : 'hero-t'">
        <view v-if="activeSport === 'tennis'" class="court-lines">
          <view class="hl top"/><view class="hl mid"/><view class="vl"/>
        </view>
        <text class="hero-deco">{{ activeSport === 'badminton' ? '🏸' : '🎾' }}</text>
        <view class="hero-inner">
          <text v-if="activeSport === 'tennis'" class="badge-txt">TENNIS</text>
          <text class="hero-title">{{ activeSport === 'badminton' ? '🏸 羽毛球赛事' : '🎾 网球赛事' }}</text>
          <text class="hero-sub">{{ activeSport === 'badminton' ? '报名、组织、记录你的每一场比赛' : '专业赛事管理，积分排名实时更新' }}</text>
          <view v-if="activeSport === 'tennis'" class="score-bar"><text class="score-txt">ACE  15  30  40</text></view>
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

      <!-- 最新赛事 -->
      <view class="section">
        <view class="sec-hd">
          <view style="display:flex;align-items:center;gap:12rpx">
            <view class="dot" :class="activeSport==='badminton' ? 'dot-b' : 'dot-t'"/>
            <text class="sec-title">最新赛事</text>
          </view>
          <text class="sec-more" :class="activeSport==='badminton' ? 'more-b' : 'more-t'" @tap="goList">全部</text>
        </view>
        <view v-if="loading" class="empty">加载中…</view>
        <view v-else-if="!matches.length" class="empty">暂无赛事 {{ activeSport === 'badminton' ? '🏸' : '🎾' }}</view>
        <view v-for="m in matches" :key="m.id" class="match-item" @tap="goDetail(m.id)">
          <view class="mi-icon-wrap" :class="activeSport==='badminton' ? 'mi-b' : 'mi-t'">
            <text style="font-size:30rpx">{{ activeSport === 'badminton' ? '🏸' : '🎾' }}</text>
          </view>
          <view style="flex:1">
            <text class="mi-name">{{ m.name }}</text>
            <text class="mi-info">📍{{ m.location||'—' }} · {{ m.registeredCount }}/{{ m.maxPlayers }}</text>
          </view>
          <text :class="['badge', `s-${m.status}`]">{{ statusLabel(m.status) }}</text>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
import { api } from '../../api/index.js'

export default {
  data() {
    return {
      pref: null,           // 'badminton' | 'tennis' | 'both' | null
      activeSport: 'badminton',
      showSwitcher: false,
      matches: [],
      loading: false,
    }
  },
  computed: {
    themeCls() {
      if (!this.pref) return 'theme-neutral'
      return this.activeSport === 'badminton' ? 'theme-b' : 'theme-t'
    },
    topbarStyle() {
      if (this.activeSport === 'badminton') return 'background:#fff; border-bottom: 2rpx solid #e8f7ee;'
      return 'background:#fff; border-bottom: 2rpx solid #fde3d0;'
    }
  },
  onShow() {
    const saved = uni.getStorageSync('sportPref')
    if (saved) {
      this.pref = saved
      this.activeSport = saved === 'both' ? 'badminton' : saved
      // 同步 profile 页的运动切换
      const active = uni.getStorageSync('activeSport')
      if (active && (saved === 'both' || saved === active)) this.activeSport = active
    }
    if (this.pref) this.loadMatches()
  },
  watch: {
    activeSport() { this.loadMatches() }
  },
  methods: {
    setPref(val) {
      uni.setStorageSync('sportPref', val)
      this.pref = val
      this.activeSport = val === 'both' ? 'badminton' : val
      this.loadMatches()
    },
    resetPref() {
      uni.removeStorageSync('sportPref')
      this.pref = null
      this.showSwitcher = false
    },
    switchTo(sport) {
      uni.setStorageSync('activeSport', sport)
      this.activeSport = sport
      this.showSwitcher = false
    },
    async loadMatches() {
      this.loading = true
      try {
        const r = await api.matches(`?sport=${this.activeSport}&size=5`)
        this.matches = r.data?.list || []
      } catch { this.matches = [] }
      this.loading = false
    },
    goRegister() { uni.navigateTo({ url: `/pages/match/list?sport=${this.activeSport}` }) },
    goCreate() {
      if (!getApp().globalData.token) { uni.switchTab({ url: '/pages/profile/index' }); return }
      uni.navigateTo({ url: `/pages/match/create?sport=${this.activeSport}` })
    },
    goDetail(id) { uni.navigateTo({ url: `/pages/match/detail?id=${id}` }) },
    goList() { uni.navigateTo({ url: `/pages/match/list?sport=${this.activeSport}` }) },
    goProfile() { uni.switchTab({ url: '/pages/profile/index' }) },
    statusLabel(s) {
      const m = { open: '报名中', ongoing: '进行中', finished: '已结束' }
      return m[s] || s
    }
  }
}
</script>

<style lang="scss">
/* 基础 */
.page { min-height: 100vh; background: #f4f5f7; padding-bottom: 80rpx; }

/* ===== Onboard ===== */
.onboard { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60rpx 40rpx; background: #fff; }
.ob-top { text-align: center; margin-bottom: 60rpx; }
.ob-logo { font-size: 100rpx; display: block; margin-bottom: 24rpx; }
.ob-title { display: block; font-size: 48rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 16rpx; }
.ob-sub { display: block; font-size: 26rpx; color: #888; }
.ob-cards { display: flex; gap: 24rpx; width: 100%; margin-bottom: 32rpx; }
.ob-card {
  flex: 1; border-radius: 32rpx; padding: 50rpx 24rpx; display: flex; flex-direction: column;
  align-items: center; gap: 16rpx; box-shadow: 0 8rpx 30rpx rgba(0,0,0,.1);
}
.badminton-card { background: linear-gradient(145deg, #0faa4e, #1DB954); }
.tennis-card    { background: linear-gradient(145deg, #b5451b, #d4541f); }
.ob-emoji   { font-size: 80rpx; }
.ob-sport   { font-size: 38rpx; font-weight: bold; color: #fff; }
.ob-sport-en { font-size: 22rpx; color: rgba(255,255,255,.7); }
.ob-both { background: #f0f2f5; border-radius: 60rpx; padding: 28rpx 60rpx; }
.ob-both-txt { font-size: 32rpx; color: #555; font-weight: 500; }

/* ===== Topbar ===== */
.topbar {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 88rpx 32rpx 20rpx;
}
.tb-left { flex: 1; }
.tb-right { }

.sport-switcher { display: inline-flex; align-items: center; gap: 10rpx; padding: 14rpx 24rpx; background: #f5f5f5; border-radius: 50rpx; }
.sw-emoji { font-size: 34rpx; }
.sw-name  { font-size: 32rpx; font-weight: bold; color: #1a1a1a; }
.sw-arrow { font-size: 22rpx; color: #888; transition: transform .2s; }
.sw-arrow.open { transform: rotate(180deg); }

.sport-tabs { display: inline-flex; background: #f0f2f5; border-radius: 50rpx; padding: 6rpx; gap: 4rpx; }
.st { padding: 16rpx 32rpx; border-radius: 50rpx; font-size: 28rpx; color: #888; font-weight: 500; }
.st-active-b { background: #1DB954; color: #fff; }
.st-active-t { background: #d4541f; color: #fff; }

.avatar-btn { width: 72rpx; height: 72rpx; background: #f0f2f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.avatar-emoji { font-size: 40rpx; }

/* 下拉菜单 */
.switcher-drop {
  position: absolute; top: 160rpx; left: 32rpx; z-index: 200;
  background: #fff; border-radius: 20rpx; padding: 12rpx 0;
  box-shadow: 0 8rpx 40rpx rgba(0,0,0,.15); min-width: 300rpx;
}
.sd-item { padding: 28rpx 36rpx; font-size: 30rpx; color: #1a1a1a; }
.sd-item:active { background: #f5f5f5; }
.sd-pref { color: #888; border-top: 1rpx solid #f0f0f0; margin-top: 8rpx; }
.mask { position: fixed; inset: 0; z-index: 150; }

/* ===== Hero ===== */
.hero { padding: 40rpx 40rpx 50rpx; position: relative; overflow: hidden; }
.hero-b { background: linear-gradient(145deg, #0faa4e, #1DB954, #25d366); }
.hero-t { background: linear-gradient(145deg, #b5451b, #d4541f, #e8712a); }
.hero-deco { position: absolute; font-size: 120rpx; opacity: .15; top: 10rpx; right: 20rpx; }
.hero-inner { position: relative; z-index: 2; }
.badge-txt { display: inline-block; background: rgba(255,255,255,.2); color: rgba(255,255,255,.9); font-size: 20rpx; font-weight: bold; padding: 6rpx 20rpx; border-radius: 50rpx; letter-spacing: 4rpx; margin-bottom: 16rpx; border: 1rpx solid rgba(255,255,255,.3); }
.hero-title { display: block; font-size: 44rpx; font-weight: bold; color: #fff; margin-bottom: 10rpx; }
.hero-sub   { display: block; font-size: 26rpx; color: rgba(255,255,255,.8); margin-bottom: 20rpx; }
.court-lines { position: absolute; inset: 0; opacity: .1; }
.hl { position: absolute; height: 2rpx; left: 0; right: 0; background: #fff; }
.top { top: 40rpx; } .mid { top: 50%; }
.vl { position: absolute; width: 2rpx; top: 0; bottom: 0; left: 50%; background: #fff; }
.score-bar { display: inline-block; background: rgba(0,0,0,.25); padding: 10rpx 24rpx; border-radius: 12rpx; }
.score-txt { font-size: 24rpx; color: rgba(255,255,255,.9); letter-spacing: 8rpx; }

/* ===== 功能入口 ===== */
.action-row { display: flex; gap: 20rpx; padding: 24rpx 24rpx 0; }
.action-card { flex: 1; background: #fff; border-radius: 24rpx; padding: 30rpx 24rpx; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4rpx 20rpx rgba(0,0,0,.06); }
.ac-icon { width: 96rpx; height: 96rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center; font-size: 48rpx; margin-bottom: 16rpx; }
.ac-title { font-size: 32rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 8rpx; }
.ac-desc  { font-size: 22rpx; color: #888; text-align: center; }

/* ===== 赛事列表 ===== */
.section { margin: 24rpx; background: #fff; border-radius: 24rpx; padding: 30rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,.06); }
.sec-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.dot { width: 8rpx; height: 36rpx; border-radius: 4rpx; }
.dot-b { background: #1DB954; } .dot-t { background: #d4541f; }
.sec-title { font-size: 32rpx; font-weight: bold; color: #1a1a1a; }
.sec-more  { font-size: 26rpx; }
.more-b { color: #1DB954; } .more-t { color: #d4541f; }

.match-item { display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5; gap: 16rpx; }
.match-item:last-child { border-bottom: none; }
.mi-icon-wrap { width: 60rpx; height: 60rpx; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; }
.mi-b { background: #e8f7ee; } .mi-t { background: #fdf0e8; }
.mi-name { display: block; font-size: 30rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 6rpx; }
.mi-info { font-size: 22rpx; color: #888; }

.badge { font-size: 22rpx; padding: 8rpx 18rpx; border-radius: 50rpx; }
.s-open     { background: #e8f7ee; color: #1DB954; }
.s-ongoing  { background: #1DB954; color: #fff; }
.s-finished { background: #f5f5f5; color: #999; }

.empty { text-align: center; padding: 60rpx 0; color: #aaa; font-size: 28rpx; }
</style>

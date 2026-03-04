<template>
  <view class="page">

    <!-- Hero：颜色跟随运动切换 -->
    <view class="hero" :class="activeSport === 'badminton' ? 'hero-b' : 'hero-t'">
      <text class="hero-deco">{{ activeSport === 'badminton' ? '🏸' : '🎾' }}</text>

      <!-- 用户信息行：头像 + 名字 + 运动切换 -->
      <view class="hero-row">
        <view class="avatar-wrap">
          <image v-if="user&&user.avatar" :src="user.avatar" class="avatar-img" mode="aspectFill"/>
          <text v-else class="avatar-emoji">🏅</text>
        </view>
        <view class="hero-info">
          <text class="username">{{ user ? (user.nickname||'运动员') : '未登录' }}</text>
          <text v-if="user&&user.phone" class="phone">{{ user.phone }}</text>
          <text v-else-if="!token" class="phone-sub" @tap="goLogin">点击登录 ›</text>
        </view>

        <!-- 运动切换 Tab（始终显示） -->
        <view class="sport-tabs">
          <view :class="['st', activeSport==='badminton' && 'st-active']" @tap="switchSport('badminton')">
            <text class="st-emoji">🏸</text>
            <text class="st-label">羽毛球</text>
          </view>
          <view :class="['st', activeSport==='tennis' && 'st-active']" @tap="switchSport('tennis')">
            <text class="st-emoji">🎾</text>
            <text class="st-label">网球</text>
          </view>
        </view>
      </view>

      <!-- 数据统计（登录后，按运动区分） -->
      <view v-if="token" class="stat-row">
        <view class="stat-col">
          <text class="stat-n">{{ stats.matches }}</text>
          <text class="stat-l">参赛场次</text>
        </view>
        <view class="stat-sep"/>
        <view class="stat-col">
          <text class="stat-n">{{ stats.wins }}</text>
          <text class="stat-l">胜场</text>
        </view>
        <view class="stat-sep"/>
        <view class="stat-col">
          <text class="stat-n">{{ stats.rate }}</text>
          <text class="stat-l">胜率</text>
        </view>
        <view class="stat-sep"/>
        <view class="stat-col">
          <text class="stat-n">{{ stats.points }}</text>
          <text class="stat-l">积分</text>
        </view>
      </view>

      <!-- 未登录提示 -->
      <view v-else class="login-hint" @tap="goLogin">
        <text class="lh-txt">登录后查看你的赛事数据 ›</text>
      </view>

    </view>

    <!-- 球拍推荐 Banner -->
    <view class="racket-banner" @tap="goRacket">
      <view class="rb-body">
        <text class="rb-emoji">{{ activeSport === 'badminton' ? '🏸' : '🎾' }}</text>
        <view class="rb-text">
          <view class="rb-title-row">
            <text class="rb-title">智能球拍推荐</text>
            <text class="rb-tag">免费</text>
          </view>
          <text class="rb-sub">根据你的身体数据，精准匹配最适合的球拍</text>
        </view>
      </view>
      <text class="rb-arrow">›</text>
    </view>

    <!-- 我的赛事（需登录） -->
    <view v-if="token" class="section-card">
      <view class="section-title">{{ activeSport === 'badminton' ? '🏸 羽毛球赛事' : '🎾 网球赛事' }}</view>
      <view class="menu-item" @tap="goRegList">
        <view class="mi-left">
          <text class="mi-icon">📋</text>
          <text class="mi-label">我的报名</text>
        </view>
        <text class="mi-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goHistory">
        <view class="mi-left">
          <text class="mi-icon">🏆</text>
          <text class="mi-label">比赛记录</text>
        </view>
        <text class="mi-arrow">›</text>
      </view>
    </view>

    <!-- 通用设置 -->
    <view class="section-card">
      <view class="section-title">设置</view>
      <view class="menu-item" @tap="goLang">
        <view class="mi-left">
          <text class="mi-icon">🌐</text>
          <text class="mi-label">语言设置</text>
        </view>
        <text class="mi-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goSettings">
        <view class="mi-left">
          <text class="mi-icon">⚙️</text>
          <text class="mi-label">账号设置</text>
        </view>
        <text class="mi-arrow">›</text>
      </view>
    </view>

    <button v-if="token" class="logout-btn" @tap="logout">退出登录</button>

  </view>
</template>

<script>
const emptyStats = () => ({ matches: 0, wins: 0, rate: '0%', points: 0 })

export default {
  data() {
    return {
      token: '',
      user: null,
      activeSport: uni.getStorageSync('activeSport') || 'badminton',
      statsMap: { badminton: emptyStats(), tennis: emptyStats() },
    }
  },
  computed: {
    stats() { return this.statsMap[this.activeSport] }
  },
  onShow() {
    this.token = getApp().globalData.token || ''
    this.user  = getApp().globalData.userInfo || null
    const saved = uni.getStorageSync('activeSport')
    if (saved) this.activeSport = saved
    if (this.token) this.loadStats()
  },
  methods: {
    switchSport(sport) {
      this.activeSport = sport
      uni.setStorageSync('activeSport', sport)
      if (this.token) this.loadStats()
    },
    async loadStats() {
      // TODO: GET /api/users/me/stats/?sport=xxx
    },
    goLogin()    { uni.navigateTo({ url: '/pages/profile/login' }) },
    goRacket()   { uni.navigateTo({ url: '/pages/racket/recommend' }) },
    goRegList()  { uni.showToast({ title: '开发中', icon: 'none' }) },
    goHistory()  { uni.showToast({ title: '开发中', icon: 'none' }) },
    goLang()     { uni.navigateTo({ url: '/pages/settings/language' }) },
    goSettings() { uni.showToast({ title: '开发中', icon: 'none' }) },
    logout() {
      uni.showModal({
        title: '退出登录', content: '确定要退出吗？',
        success: res => {
          if (res.confirm) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            getApp().globalData.token = ''
            getApp().globalData.userInfo = null
            this.token = ''
            this.user  = null
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.page { background: #f0f2f5; min-height: 100vh; padding-bottom: 80rpx; }

/* ── Hero ── */
.hero {
  padding: 80rpx 40rpx 40rpx;
  position: relative; overflow: hidden;
  transition: background .3s;
}
.hero-b { background: linear-gradient(145deg, #0a7a38, #1DB954, #25d366); }
.hero-t { background: linear-gradient(145deg, #8a3010, #d4541f, #e8712a); }

.hero-deco {
  position: absolute; font-size: 200rpx;
  opacity: .08; right: -20rpx; top: 20rpx;
  line-height: 1;
}

/* 信息行 */
.hero-row {
  display: flex; align-items: center; gap: 20rpx;
  position: relative; z-index: 2;
}
.avatar-wrap {
  width: 100rpx; height: 100rpx; border-radius: 50%;
  border: 3rpx solid rgba(255,255,255,.3);
  overflow: hidden; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,.15);
}
.avatar-img   { width: 100%; height: 100%; }
.avatar-emoji { font-size: 56rpx; }
.hero-info    { flex: 1; min-width: 0; }
.username     { display: block; font-size: 34rpx; font-weight: bold; color: #fff; margin-bottom: 6rpx; }
.phone        { font-size: 22rpx; color: rgba(255,255,255,.6); }
.phone-sub    { font-size: 22rpx; color: rgba(255,255,255,.5); }

/* 运动切换 Tab */
.sport-tabs {
  display: flex; flex-direction: column;
  gap: 8rpx; flex-shrink: 0;
}
.st {
  display: flex; align-items: center; gap: 8rpx;
  padding: 10rpx 20rpx; border-radius: 50rpx;
  background: rgba(255,255,255,.15);
  border: 1rpx solid rgba(255,255,255,.2);
}
.st-active {
  background: rgba(255,255,255,.9);
}
.st-active .st-emoji  { opacity: 1; }
.st-active .st-label  { color: #1a1a1a; font-weight: bold; }
.st-emoji { font-size: 26rpx; }
.st-label { font-size: 22rpx; color: rgba(255,255,255,.9); }

/* 统计条 */
.stat-row {
  display: flex; align-items: center;
  margin-top: 32rpx;
  background: rgba(255,255,255,.15);
  border-radius: 20rpx; padding: 24rpx 0;
  position: relative; z-index: 2;
}
.stat-col { flex: 1; text-align: center; }
.stat-n   { display: block; font-size: 38rpx; font-weight: bold; color: #fff; margin-bottom: 4rpx; }
.stat-l   { font-size: 20rpx; color: rgba(255,255,255,.6); }
.stat-sep { width: 1rpx; height: 36rpx; background: rgba(255,255,255,.2); }

/* 未登录提示 */
.login-hint {
  margin-top: 28rpx;
  background: rgba(255,255,255,.15);
  border-radius: 20rpx; padding: 24rpx;
  text-align: center;
  position: relative; z-index: 2;
  border: 1rpx dashed rgba(255,255,255,.3);
}
.lh-txt { font-size: 28rpx; color: rgba(255,255,255,.85); }

/* ── 球拍推荐 Banner ── */
.racket-banner {
  margin: 24rpx 24rpx 0;
  background: linear-gradient(135deg, #2c3e50, #4a5568);
  border-radius: 24rpx; padding: 28rpx 30rpx;
  display: flex; align-items: center;
  box-shadow: 0 8rpx 28rpx rgba(0,0,0,.18);
}
.rb-body  { display: flex; align-items: center; gap: 20rpx; flex: 1; }
.rb-emoji { font-size: 56rpx; }
.rb-text  { flex: 1; }
.rb-title-row { display: flex; align-items: center; gap: 12rpx; margin-bottom: 6rpx; }
.rb-title { font-size: 30rpx; font-weight: bold; color: #fff; }
.rb-tag   { background: rgba(255,255,255,.2); color: rgba(255,255,255,.9); font-size: 20rpx; padding: 4rpx 14rpx; border-radius: 50rpx; }
.rb-sub   { font-size: 22rpx; color: rgba(255,255,255,.65); }
.rb-arrow { font-size: 44rpx; color: rgba(255,255,255,.5); }

/* ── 功能卡片 ── */
.section-card {
  margin: 24rpx 24rpx 0;
  background: #fff; border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,.05);
}
.section-title { font-size: 22rpx; color: #aaa; font-weight: 600; padding: 20rpx 30rpx 12rpx; letter-spacing: 1rpx; }
.menu-item { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 30rpx; border-top: 1rpx solid #f5f5f5; }
.mi-left  { display: flex; align-items: center; gap: 20rpx; }
.mi-icon  { font-size: 34rpx; width: 44rpx; text-align: center; }
.mi-label { font-size: 30rpx; color: #1a1a1a; }
.mi-arrow { font-size: 36rpx; color: #ccc; }

/* ── 退出 ── */
.logout-btn {
  margin: 24rpx 24rpx 0;
  background: transparent; color: #e53935;
  border: 2rpx solid #ffcdd2; border-radius: 50rpx;
  height: 88rpx; font-size: 30rpx;
  width: calc(100% - 48rpx);
}
</style>

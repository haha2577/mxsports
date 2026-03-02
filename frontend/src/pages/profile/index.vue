<template>
  <view class="page">
    <view class="hero">
      <view class="avatar-wrap">
        <image v-if="user&&user.avatar" :src="user.avatar" class="avatar-img" mode="aspectFill"/>
        <text v-else class="avatar-emoji">🏅</text>
      </view>
      <text class="username">{{ user ? (user.nickname||'运动员') : t.profile.notLogin }}</text>
      <text v-if="user&&user.phone" class="phone">📱 {{ user.phone }}</text>
    </view>

    <!-- 未登录 -->
    <view v-if="!token" class="login-area">
      <button class="login-btn" @tap="goLogin">{{ t.auth.login }}</button>
    </view>

    <!-- 已登录 -->
    <view v-else>
      <view class="stat-card">
        <view class="stat-col"><text class="stat-n">0</text><text class="stat-l">{{ t.profile.stats.matches }}</text></view>
        <view class="stat-div"/>
        <view class="stat-col"><text class="stat-n">0</text><text class="stat-l">{{ t.profile.stats.wins }}</text></view>
        <view class="stat-div"/>
        <view class="stat-col"><text class="stat-n">0%</text><text class="stat-l">{{ t.profile.stats.rate }}</text></view>
      </view>
      <view class="menu-card">
        <view class="menu-item" @tap="goRegList"><text class="mi-icon">📋</text><text class="mi-label">{{ t.profile.myReg }}</text><text class="mi-arrow">›</text></view>
        <view class="menu-item" @tap="goHistory"><text class="mi-icon">🏆</text><text class="mi-label">{{ t.profile.history }}</text><text class="mi-arrow">›</text></view>
        <view class="menu-item" @tap="goLang"><text class="mi-icon">🌐</text><text class="mi-label">{{ t.profile.langSetting }}</text><text class="mi-arrow">›</text></view>
        <view class="menu-item" @tap="goSettings"><text class="mi-icon">⚙️</text><text class="mi-label">{{ t.profile.settings }}</text><text class="mi-arrow">›</text></view>
      </view>
      <button class="logout-btn" @tap="logout">{{ t.auth.logout }}</button>
    </view>
  </view>
</template>
<script>
import { t } from '../../locales/index.js'
export default {
  data() { return { t:t(), token:'', user:null } },
  onShow() {
    this.t=t()
    this.token=getApp().globalData.token||''
    this.user=getApp().globalData.userInfo||null
  },
  methods: {
    goLogin() { uni.navigateTo({ url:'/pages/profile/login' }) },
    goRegList() { uni.showToast({ title:'开发中', icon:'none' }) },
    goHistory()  { uni.showToast({ title:'开发中', icon:'none' }) },
    goLang()     { uni.navigateTo({ url:'/pages/settings/language' }) },
    goSettings() { uni.showToast({ title:'开发中', icon:'none' }) },
    logout() {
      uni.showModal({ title:this.t.auth.logout, content:this.t.auth.logoutConfirm, success: res => {
        if (res.confirm) {
          uni.removeStorageSync('token'); uni.removeStorageSync('userInfo')
          getApp().globalData.token=''; getApp().globalData.userInfo=null
          this.token=''; this.user=null
        }
      }})
    }
  }
}
</script>
<style lang="scss">
.page{background:#f0f2f5;min-height:100vh;padding-bottom:80rpx}
.hero{background:linear-gradient(145deg,#1a1a2e,#0f3460);padding:80rpx 40rpx 50rpx;display:flex;flex-direction:column;align-items:center;gap:16rpx}
.avatar-wrap{width:120rpx;height:120rpx;border-radius:50%;border:4rpx solid rgba(255,255,255,.3);overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.1)}
.avatar-img{width:100%;height:100%}
.avatar-emoji{font-size:70rpx}
.username{font-size:38rpx;font-weight:bold;color:#fff}
.phone{font-size:24rpx;color:rgba(255,255,255,.6)}
.login-area{padding:40rpx 30rpx}
.login-btn{background:#1DB954;color:#fff;border:none;border-radius:50rpx;height:88rpx;font-size:32rpx;font-weight:bold;width:100%}
.stat-card{margin:24rpx;background:#fff;border-radius:24rpx;padding:30rpx 0;display:flex;box-shadow:0 4rpx 20rpx rgba(0,0,0,.06)}
.stat-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:8rpx}
.stat-n{font-size:44rpx;font-weight:bold;color:#1a1a1a}
.stat-l{font-size:22rpx;color:#888}
.stat-div{width:1rpx;background:#eee;margin:16rpx 0}
.menu-card{margin:0 24rpx 20rpx;background:#fff;border-radius:24rpx;overflow:hidden;box-shadow:0 4rpx 20rpx rgba(0,0,0,.06)}
.menu-item{display:flex;align-items:center;padding:28rpx 30rpx;border-bottom:1rpx solid #f5f5f5}
.menu-item:last-child{border:none}
.mi-icon{font-size:36rpx;margin-right:20rpx;width:44rpx}
.mi-label{flex:1;font-size:30rpx;color:#1a1a1a}
.mi-arrow{font-size:36rpx;color:#ccc}
.logout-btn{margin:0 30rpx;background:transparent;color:#e53935;border:2rpx solid #ffcdd2;border-radius:50rpx;height:88rpx;font-size:30rpx}
</style>

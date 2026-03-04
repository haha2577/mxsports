<template>
  <view class="page">
    <view class="hero">
      <view class="court-lines"><view class="hl top"/><view class="hl mid"/><view class="vl"/></view>
      <text class="deco-ball">🎾</text>
      <view class="hero-inner">
        <text class="badge-txt">TENNIS</text>
        <text class="hero-title">🎾 {{ t.home.tennis }}</text>
        <text class="hero-sub">{{ t.home.tennisDesc }}</text>
        <view class="score-bar"><text class="score-txt">ACE  15  30  40</text></view>
      </view>
    </view>
    <view class="stat-strip">
      <view class="stat-col"><text class="stat-n">🏟️</text><text class="stat-l">专业场地</text></view>
      <view class="stat-div"/><view class="stat-col"><text class="stat-n">🏆</text><text class="stat-l">积分排名</text></view>
      <view class="stat-div"/><view class="stat-col"><text class="stat-n">⚡</text><text class="stat-l">实时对战</text></view>
    </view>
    <view class="action-row">
      <view class="action-card" @tap="goRegister">
        <view class="ac-icon" style="background:#fdf0e8">🎾</view>
        <text class="ac-title">{{ t.sport.register }}</text>
        <text class="ac-desc">{{ t.sport.registerDesc }}</text>
      </view>
      <view class="action-card" @tap="goCreate">
        <view class="ac-icon" style="background:#fde3d0">🏆</view>
        <text class="ac-title">{{ t.sport.organize }}</text>
        <text class="ac-desc">{{ t.sport.organizeDesc }}</text>
      </view>
    </view>
    <view class="section">
      <view class="sec-hd">
        <view style="display:flex;align-items:center;gap:12rpx"><view class="dot"/><text class="sec-title">{{ t.sport.latest }}</text></view>
        <text style="color:#d4541f;font-size:26rpx">{{ t.common.all }}</text>
      </view>
      <view v-if="loading" class="empty">{{ t.common.loading }}</view>
      <view v-else-if="!matches.length" class="empty">{{ t.sport.noData }} 🎾</view>
      <view v-for="m in matches" :key="m.id" class="match-item" @tap="goDetail(m.id)">
        <view class="mi-ball">🎾</view>
        <view style="flex:1">
          <text class="mi-name">{{ m.name }}</text>
          <text class="mi-info">📍{{ m.location||'—' }} · {{ m.registeredCount }}/{{ m.maxPlayers }}</text>
        </view>
        <text :class="['badge', `s-${m.status}`]">{{ t.match.status[m.status] }}</text>
      </view>
    </view>
  </view>
</template>
<script>
import { t } from '../../locales/index.js'
import { api } from '../../api/index.js'
export default {
  data() { return { t:t(), matches:[], loading:false } },
  onShow() { this.t=t(); this.load() },
  methods: {
    async load() {
      this.loading=true
      try { const r=await api.matches('?size=5'); this.matches=r.data?.list||[] } catch{}
      this.loading=false
    },
    goRegister() { uni.navigateTo({ url:'/pages/match/list?sport=tennis' }) },
    goCreate() {
      if (!getApp().globalData.token) { uni.switchTab({ url:'/pages/profile/index' }); return }
      uni.navigateTo({ url:'/pages/match/create?sport=tennis' })
    },
    goDetail(id) { uni.navigateTo({ url:`/pages/match/detail?id=${id}` }) }
  }
}
</script>
<style lang="scss">
.page{background:#fdf6f0;min-height:100vh;padding-bottom:80rpx}
.hero{background:linear-gradient(145deg,#b5451b,#d4541f,#e8712a);padding:70rpx 40rpx 50rpx;position:relative;overflow:hidden}
.court-lines{position:absolute;inset:0;opacity:.1}
.hl{position:absolute;height:2rpx;left:0;right:0;background:#fff}
.top{top:40rpx}.mid{top:50%}
.vl{position:absolute;width:2rpx;top:0;bottom:0;left:50%;background:#fff}
.deco-ball{position:absolute;font-size:100rpx;opacity:.18;top:10rpx;right:20rpx}
.hero-inner{position:relative;z-index:2}
.badge-txt{display:inline-block;background:rgba(255,255,255,.2);color:rgba(255,255,255,.9);font-size:20rpx;font-weight:bold;padding:6rpx 20rpx;border-radius:50rpx;letter-spacing:4rpx;margin-bottom:16rpx;border:1rpx solid rgba(255,255,255,.3)}
.hero-title{display:block;font-size:48rpx;font-weight:bold;color:#fff;margin-bottom:10rpx}
.hero-sub{display:block;font-size:26rpx;color:rgba(255,255,255,.8);margin-bottom:24rpx}
.score-bar{display:inline-block;background:rgba(0,0,0,.25);padding:10rpx 24rpx;border-radius:12rpx}
.score-txt{font-size:24rpx;color:rgba(255,255,255,.9);letter-spacing:8rpx}
.stat-strip{background:#fff;display:flex;margin:0 24rpx;margin-top:-24rpx;border-radius:20rpx;padding:24rpx 0;box-shadow:0 8rpx 30rpx rgba(212,84,31,.15);position:relative;z-index:3}
.stat-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6rpx}
.stat-n{font-size:36rpx}.stat-l{font-size:22rpx;color:#888}
.stat-div{width:1rpx;background:#eee;margin:8rpx 0}
.action-row{display:flex;gap:20rpx;padding:24rpx 24rpx 0}
.action-card{flex:1;background:#fff;border-radius:24rpx;padding:30rpx 24rpx;display:flex;flex-direction:column;align-items:center;box-shadow:0 4rpx 20rpx rgba(212,84,31,.1)}
.ac-icon{width:96rpx;height:96rpx;border-radius:24rpx;display:flex;align-items:center;justify-content:center;font-size:48rpx;margin-bottom:16rpx}
.ac-title{font-size:32rpx;font-weight:bold;color:#1a1a1a;margin-bottom:8rpx}
.ac-desc{font-size:22rpx;color:#888;text-align:center}
.section{margin:24rpx;background:#fff;border-radius:24rpx;padding:30rpx;box-shadow:0 4rpx 20rpx rgba(212,84,31,.08)}
.sec-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:24rpx}
.dot{width:8rpx;height:36rpx;background:#d4541f;border-radius:4rpx}
.sec-title{font-size:32rpx;font-weight:bold;color:#1a1a1a}
.match-item{display:flex;align-items:center;padding:20rpx 0;border-bottom:1rpx solid #fdf6f0;gap:16rpx}
.match-item:last-child{border-bottom:none}
.mi-ball{width:60rpx;height:60rpx;background:#fdf0e8;border-radius:16rpx;display:flex;align-items:center;justify-content:center;font-size:32rpx}
.mi-name{display:block;font-size:30rpx;font-weight:bold;color:#1a1a1a;margin-bottom:6rpx}
.mi-info{font-size:22rpx;color:#888}
.badge{font-size:20rpx;padding:8rpx 18rpx;border-radius:8rpx;font-weight:bold}
.s-open{background:#fff3e0;color:#d4541f;border:1rpx solid #f5c89a}
.s-ongoing{background:#d4541f;color:#fff}
.s-finished{background:#f5f5f5;color:#999}
.empty{text-align:center;padding:60rpx 0;color:#aaa;font-size:28rpx}
</style>

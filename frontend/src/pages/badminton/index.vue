<template>
  <view class="page">
    <view class="hero">
      <text class="deco1">🏸</text><text class="deco2">🏸</text>
      <view class="hero-inner">
        <text class="hero-title">🏸 {{ t.home.badminton }}</text>
        <text class="hero-sub">{{ t.home.badmintonDesc }}</text>
      </view>
    </view>
    <view class="action-row">
      <view class="action-card" @tap="goRegister">
        <view class="ac-icon" style="background:#e8f7ee">📋</view>
        <text class="ac-title">{{ t.sport.register }}</text>
        <text class="ac-desc">{{ t.sport.registerDesc }}</text>
      </view>
      <view class="action-card" @tap="goCreate">
        <view class="ac-icon" style="background:#d0f0dc">🏆</view>
        <text class="ac-title">{{ t.sport.organize }}</text>
        <text class="ac-desc">{{ t.sport.organizeDesc }}</text>
      </view>
    </view>
    <view class="section">
      <view class="sec-hd">
        <view style="display:flex;align-items:center;gap:12rpx"><view class="dot"></view><text class="sec-title">{{ t.sport.latest }}</text></view>
        <text style="color:#1DB954;font-size:26rpx">{{ t.common.all }}</text>
      </view>
      <view v-if="loading" class="empty">{{ t.common.loading }}</view>
      <view v-else-if="!matches.length" class="empty">{{ t.sport.noData }} 🏸</view>
      <view v-for="m in matches" :key="m.id" class="match-item" @tap="goDetail(m.id)">
        <text style="font-size:36rpx">🏸</text>
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
    goRegister() { uni.navigateTo({ url:'/pages/match/list?sport=badminton' }) },
    goCreate() {
      if (!getApp().globalData.token) { uni.switchTab({ url:'/pages/profile/index' }); return }
      uni.navigateTo({ url:'/pages/match/create?sport=badminton' })
    },
    goDetail(id) { uni.navigateTo({ url:`/pages/match/detail?id=${id}` }) }
  }
}
</script>
<style lang="scss">
.page{background:#f4faf4;padding-bottom:80rpx}
.hero{background:linear-gradient(145deg,#0faa4e,#1DB954,#25d366);padding:60rpx 40rpx 50rpx;position:relative;overflow:hidden}
.deco1,.deco2{position:absolute;opacity:.18}
.deco1{font-size:80rpx;top:10rpx;right:20rpx;transform:rotate(-20deg)}
.deco2{font-size:50rpx;bottom:10rpx;right:80rpx;transform:rotate(15deg)}
.hero-inner{position:relative;z-index:2}
.hero-title{display:block;font-size:48rpx;font-weight:bold;color:#fff;margin-bottom:10rpx}
.hero-sub{font-size:26rpx;color:rgba(255,255,255,.8)}
.action-row{display:flex;gap:20rpx;padding:24rpx 24rpx 0}
.action-card{flex:1;background:#fff;border-radius:24rpx;padding:30rpx 24rpx;display:flex;flex-direction:column;align-items:center;box-shadow:0 4rpx 20rpx rgba(29,185,84,.12)}
.ac-icon{width:96rpx;height:96rpx;border-radius:24rpx;display:flex;align-items:center;justify-content:center;font-size:48rpx;margin-bottom:16rpx}
.ac-title{font-size:32rpx;font-weight:bold;color:#1a1a1a;margin-bottom:8rpx}
.ac-desc{font-size:22rpx;color:#888;text-align:center}
.section{margin:24rpx;background:#fff;border-radius:24rpx;padding:30rpx;box-shadow:0 4rpx 20rpx rgba(29,185,84,.08)}
.sec-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:24rpx}
.dot{width:8rpx;height:36rpx;background:#1DB954;border-radius:4rpx}
.sec-title{font-size:32rpx;font-weight:bold;color:#1a1a1a}
.match-item{display:flex;align-items:center;padding:20rpx 0;border-bottom:1rpx solid #f0faf0;gap:16rpx}
.match-item:last-child{border-bottom:none}
.mi-name{display:block;font-size:30rpx;font-weight:bold;color:#1a1a1a;margin-bottom:6rpx}
.mi-info{font-size:22rpx;color:#888}
.badge{font-size:22rpx;padding:8rpx 18rpx;border-radius:50rpx}
.s-open{background:#e8f7ee;color:#1DB954}
.s-ongoing{background:#1DB954;color:#fff}
.s-finished{background:#f5f5f5;color:#999}
.empty{text-align:center;padding:60rpx 0;color:#aaa;font-size:28rpx}
</style>

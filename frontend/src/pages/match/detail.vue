<template>
  <view class="page">
    <view v-if="loading" class="loading"><text>{{ t.common.loading }}</text></view>
    <view v-else-if="match">
      <view class="hero">
        <text class="sport-icon">{{ isBadminton?'🏸':'🎾' }}</text>
        <text class="m-name">{{ match.name }}</text>
        <text :class="['m-badge', `s-${match.status}`]">{{ t.match.status[match.status] }}</text>
      </view>
      <view class="info-card">
        <view class="info-row"><text class="info-icon">📍</text><view><text class="info-label">比赛场地</text><text class="info-val">{{ match.location||'待定' }}</text></view></view>
        <view class="info-row"><text class="info-icon">🏅</text><view><text class="info-label">赛制</text><text class="info-val">{{ t.match.types[match.matchType]||match.matchType }}</text></view></view>
        <view class="info-row"><text class="info-icon">👥</text><view><text class="info-label">报名人数</text><text class="info-val">{{ match.registeredCount }}/{{ match.maxPlayers }}</text></view></view>
        <view v-if="match.description" class="info-row"><text class="info-icon">📝</text><view><text class="info-label">简介</text><text class="info-val">{{ match.description }}</text></view></view>
      </view>
      <view class="reg-area" v-if="match.status==='open'">
        <view class="reg-bar"><text class="reg-label">报名进度</text><text class="reg-count">{{ match.registeredCount }}/{{ match.maxPlayers }}</text></view>
        <view class="progress"><view class="progress-fill" :style="{width:(match.registeredCount/match.maxPlayers*100)+'%'}"/></view>
        <button :class="['reg-btn', registered?'reg-done':'']" @tap="doRegister" :disabled="registering||registered">
          {{ registered?'✅ 已报名' : (registering?'报名中...' : '🏸 立即报名') }}
        </button>
      </view>
    </view>
  </view>
</template>
<script>
import { t } from '../../locales/index.js'
import { api } from '../../api/index.js'
export default {
  data() { return { t:t(), match:null, loading:false, registering:false, registered:false } },
  computed: { isBadminton() { return !this.match?.sportType||this.match.sportType==='badminton' } },
  onLoad(opts) { if (opts.id) this.load(opts.id) },
  methods: {
    async load(id) {
      this.loading=true
      try { const r=await api.matchById(id); this.match=r.data } catch{}
      this.loading=false
    },
    async doRegister() {
      if (!getApp().globalData.token) { uni.navigateTo({ url:'/pages/profile/index' }); return }
      this.registering=true
      try {
        await api.register(this.match.id)
        this.registered=true; this.match.registeredCount++
        uni.showToast({ title:'报名成功 🎉', icon:'success' })
      } catch(e) { uni.showModal({ title:'报名失败', content:e.message }) }
      this.registering=false
    }
  }
}
</script>
<style lang="scss">
.page{background:#f0f2f5;padding-bottom:100rpx}
.loading{display:flex;justify-content:center;align-items:center;height:400rpx;color:#aaa;font-size:28rpx}
.hero{background:linear-gradient(145deg,#1a1a2e,#0f3460);padding:60rpx 40rpx 50rpx;display:flex;flex-direction:column;align-items:center;gap:16rpx}
.sport-icon{font-size:90rpx}
.m-name{font-size:40rpx;font-weight:bold;color:#fff;text-align:center}
.m-badge{font-size:24rpx;padding:10rpx 28rpx;border-radius:50rpx}
.s-open{background:rgba(29,185,84,.25);color:#1DB954;border:1rpx solid rgba(29,185,84,.4)}
.s-ongoing{background:#1DB954;color:#fff}
.s-finished{background:rgba(255,255,255,.1);color:rgba(255,255,255,.6)}
.info-card{margin:24rpx;background:#fff;border-radius:24rpx;padding:10rpx 30rpx;box-shadow:0 4rpx 16rpx rgba(0,0,0,.06)}
.info-row{display:flex;align-items:flex-start;padding:22rpx 0;border-bottom:1rpx solid #f5f5f5;gap:20rpx}
.info-row:last-child{border:none}
.info-icon{font-size:36rpx;width:50rpx}
.info-label{display:block;font-size:22rpx;color:#888;margin-bottom:4rpx}
.info-val{display:block;font-size:30rpx;color:#1a1a1a;font-weight:500}
.reg-area{margin:0 24rpx;background:#fff;border-radius:24rpx;padding:30rpx;box-shadow:0 4rpx 16rpx rgba(0,0,0,.06)}
.reg-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:16rpx}
.reg-label{font-size:28rpx;font-weight:bold;color:#1a1a1a}
.reg-count{font-size:28rpx;color:#1DB954;font-weight:bold}
.progress{height:12rpx;background:#e8f7ee;border-radius:6rpx;margin-bottom:30rpx;overflow:hidden}
.progress-fill{height:100%;background:#1DB954;border-radius:6rpx;transition:width .3s}
.reg-btn{width:100%;background:#1DB954;color:#fff;border:none;border-radius:50rpx;height:88rpx;font-size:32rpx;font-weight:bold}
.reg-done{background:#f5f5f5;color:#999}
</style>

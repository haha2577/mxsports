<template>
  <view class="page">
    <view class="header">
      <view>
        <text class="greeting">Hi，{{ username }} 👋</text>
        <text class="subtitle">{{ t.home.title }}</text>
      </view>
      <view class="avatar" @tap="() => uni.switchTab({ url: '/pages/profile/index' })">🙋</view>
    </view>

    <view class="cards">
      <!-- 羽毛球 -->
      <view class="sport-card badminton" @tap="() => uni.navigateTo({ url: '/pages/badminton/index' })">
        <view class="bg-deco">BADMINTON</view>
        <view class="deco-emoji top-right">🏸</view>
        <view class="content">
          <text class="s-emoji">🏸</text>
          <text class="s-name">{{ t.home.badminton }}</text>
          <text class="s-desc">{{ t.home.badmintonDesc }}</text>
          <view class="tags">
            <text class="tag">{{ t.sport.register }}</text>
            <text class="tag">{{ t.sport.organize }}</text>
          </view>
          <view class="enter-btn"><text class="enter-txt">{{ t.home.enter }} →</text></view>
        </view>
      </view>

      <!-- 网球 -->
      <view class="sport-card tennis" @tap="() => uni.navigateTo({ url: '/pages/tennis/index' })">
        <view class="bg-deco">TENNIS</view>
        <view class="deco-emoji top-right">🎾</view>
        <view class="content">
          <text class="s-emoji">🎾</text>
          <text class="s-name">{{ t.home.tennis }}</text>
          <text class="s-desc">{{ t.home.tennisDesc }}</text>
          <view class="tags">
            <text class="tag">{{ t.sport.register }}</text>
            <text class="tag">{{ t.sport.organize }}</text>
          </view>
          <view class="enter-btn"><text class="enter-txt tennis-txt">{{ t.home.enter }} →</text></view>
        </view>
      </view>
    </view>

    <text class="coming-soon">{{ t.home.comingSoon }}</text>
    <text class="version">v{{ version }}</text>
  </view>
</template>

<script>
import { t, getLang } from '../../locales/index.js'
export default {
  data() {
    return { t: t(), version: '1.0.0', username: '运动员' }
  },
  onShow() {
    this.t = t()
    const u = getApp().globalData.userInfo
    this.username = u?.nickname || (getLang() === 'en' ? 'Athlete' : '运动员')
  }
}
</script>

<style lang="scss">
.page { min-height: 100vh; background: #f0f2f5; padding-bottom: 80rpx; }
.header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 100rpx 40rpx 32rpx; }
.greeting { display: block; font-size: 42rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 8rpx; }
.subtitle  { font-size: 26rpx; color: #888; }
.avatar    { width: 80rpx; height: 80rpx; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 44rpx; }
.cards     { padding: 24rpx; display: flex; flex-direction: column; gap: 24rpx; }

.sport-card {
  border-radius: 32rpx; padding: 48rpx 44rpx; position: relative; overflow: hidden;
  min-height: 340rpx; display: flex; flex-direction: column; justify-content: flex-end;
  box-shadow: 0 12rpx 40rpx rgba(0,0,0,.15);
}
.badminton { background: linear-gradient(145deg, #0faa4e, #1DB954, #25d366); }
.tennis    { background: linear-gradient(145deg, #b5451b, #d4541f, #e8712a); }

.bg-deco    { position: absolute; top: 20rpx; right: -20rpx; font-size: 88rpx; font-weight: 900; color: rgba(255,255,255,.08); }
.deco-emoji { position: absolute; font-size: 100rpx; opacity: .18; }
.top-right  { top: 20rpx; right: 20rpx; }
.content    { position: relative; z-index: 2; }
.s-emoji    { display: block; font-size: 80rpx; margin-bottom: 16rpx; }
.s-name     { display: block; font-size: 56rpx; font-weight: bold; color: #fff; margin-bottom: 10rpx; }
.s-desc     { display: block; font-size: 26rpx; color: rgba(255,255,255,.8); margin-bottom: 28rpx; }
.tags       { display: flex; gap: 16rpx; margin-bottom: 36rpx; }
.tag        { background: rgba(255,255,255,.22); color: #fff; font-size: 24rpx; padding: 10rpx 24rpx; border-radius: 50rpx; border: 1rpx solid rgba(255,255,255,.3); }
.enter-btn  { display: inline-flex; background: rgba(255,255,255,.95); border-radius: 50rpx; padding: 18rpx 44rpx; }
.enter-txt  { color: #1DB954; font-size: 30rpx; font-weight: bold; }
.tennis-txt { color: #d4541f; }
.coming-soon { display: block; text-align: center; color: #bbb; font-size: 24rpx; margin-top: 16rpx; }
.version     { display: block; text-align: center; color: #ddd; font-size: 20rpx; margin-top: 8rpx; }
</style>

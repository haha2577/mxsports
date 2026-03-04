<template>
  <view class="page">
    <view class="header" :style="`padding-top:${statusBarHeight+12}px`">
      <view class="hd-row">
        <view class="back-btn" @tap="uni.navigateBack()">‹</view>
        <text class="hd-title">场馆详情</text>
      </view>
    </view>
    <view class="placeholder">
      <text class="ph-icon">🏟️</text>
      <text class="ph-txt">场馆详情页开发中</text>
    </view>
  </view>
</template>
<script>
export default {
  data() { return { statusBarHeight:20 } },
  onLoad() { try { this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight||20 } catch(e){} }
}
</script>
<style lang="scss">
.header { background:linear-gradient(145deg,#1a1a2e,#0f3460); padding:0 32rpx 20rpx; }
.hd-row { display:flex; align-items:center; gap:16rpx; }
.back-btn { font-size:56rpx; color:#fff; width:60rpx; line-height:1; margin-top:-4rpx; }
.hd-title { color:#fff; font-weight:bold; font-size:34rpx; }
.placeholder { display:flex; flex-direction:column; align-items:center; padding:100rpx; }
.ph-icon { font-size:100rpx; margin-bottom:20rpx; }
.ph-txt  { font-size:30rpx; color:#aaa; }
</style>

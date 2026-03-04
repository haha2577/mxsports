<template>
  <view class="page">
    <view class="header" :style="`padding-top:${statusBarHeight+12}px`">
      <view class="hd-row">
        <view class="back-btn" @tap="uni.navigateBack()">‹</view>
        <text class="hd-title" style="font-size:30rpx">资讯详情</text>
      </view>
    </view>
    <view class="content">
      <view class="cover-wrap">
        <text class="cover-icon">📰</text>
      </view>
      <view class="body-wrap">
        <view class="cat-tag">赛事动态</view>
        <text class="art-title">文章标题（开发中）</text>
        <text class="art-date">2025-03-04</text>
        <text class="art-body">资讯内容功能正在开发中，敬请期待。</text>
      </view>
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
.page { background:#f0f2f5; }
.header { background:linear-gradient(145deg,#1a1a2e,#0f3460); padding:0 32rpx 20rpx; }
.hd-row { display:flex; align-items:center; gap:16rpx; }
.back-btn { font-size:56rpx; color:#fff; width:60rpx; line-height:1; margin-top:-4rpx; }
.hd-title { color:#fff; font-weight:bold; }
.cover-wrap { height:320rpx; background:#1a1a2e; display:flex; align-items:center; justify-content:center; }
.cover-icon { font-size:120rpx; opacity:.3; }
.body-wrap { padding:32rpx; background:#fff; margin:20rpx; border-radius:24rpx; }
.cat-tag   { display:inline-block; background:#e8f7ee; color:#1DB954; font-size:22rpx; padding:4rpx 16rpx; border-radius:50rpx; margin-bottom:16rpx; }
.art-title { display:block; font-size:36rpx; font-weight:bold; color:#1a1a1a; margin-bottom:12rpx; }
.art-date  { display:block; font-size:22rpx; color:#bbb; margin-bottom:24rpx; }
.art-body  { display:block; font-size:28rpx; color:#555; line-height:1.8; }
</style>

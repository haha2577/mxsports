<template>
  <view class="page">
    <view v-for="item in langs" :key="item.k" class="lang-item" @tap="setLang(item.k)">
      <view>
        <text class="l-name">{{ item.label }}</text>
        <text class="l-sub">{{ item.sub }}</text>
      </view>
      <text v-if="current===item.k" class="check">✓</text>
    </view>
  </view>
</template>
<script>
import { getLang, setLang, t } from '../../locales/index.js'
export default {
  data() {
    return {
      current: getLang(),
      langs: [
        { k:'zh',  label:'中文',           sub:'Chinese' },
        { k:'en',  label:'English',        sub:'英文' },
      ]
    }
  },
  methods: {
    setLang(k) {
      setLang(k); this.current=k
      uni.showToast({ title:t().lang.saved, icon:'success' })
      setTimeout(()=>uni.navigateBack(), 1000)
    }
  }
}
</script>
<style lang="scss">
.page{background:#f5f5f5;min-height:100vh;padding:24rpx}
.lang-item{background:#fff;border-radius:20rpx;padding:32rpx 36rpx;display:flex;justify-content:space-between;align-items:center;margin-bottom:16rpx;box-shadow:0 2rpx 10rpx rgba(0,0,0,.05)}
.l-name{display:block;font-size:32rpx;color:#1a1a1a;margin-bottom:6rpx}
.l-sub{display:block;font-size:24rpx;color:#aaa}
.check{font-size:40rpx;color:#1DB954;font-weight:bold}
</style>

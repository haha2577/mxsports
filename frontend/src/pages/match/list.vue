<template>
  <view class="page">
    <view class="search-bar">
      <input class="search-inp" v-model="keyword" placeholder="搜索赛事名称" @confirm="load" />
    </view>
    <view v-if="loading" class="empty">{{ t.common.loading }}</view>
    <view v-else-if="!list.length" class="empty">暂无赛事</view>
    <view v-for="m in list" :key="m.id" class="match-item" @tap="goDetail(m.id)">
      <text class="mi-icon">{{ sport==='tennis'?'🎾':'🏸' }}</text>
      <view style="flex:1">
        <text class="mi-name">{{ m.name }}</text>
        <text class="mi-info">📍{{ m.location||'—' }} · {{ m.registeredCount }}/{{ m.maxPlayers }}</text>
      </view>
      <text :class="['badge', `s-${m.status}`]">{{ t.match.status[m.status] }}</text>
    </view>
  </view>
</template>
<script>
import { t } from '../../locales/index.js'
import { api } from '../../api/index.js'
export default {
  data() { return { t:t(), sport:'badminton', list:[], loading:false, keyword:'' } },
  onLoad(opts) { if(opts.sport) this.sport=opts.sport; this.load() },
  methods: {
    async load() {
      this.loading=true
      try { const r=await api.matches(`?size=20`); this.list=r.data?.list||[] } catch{}
      this.loading=false
    },
    goDetail(id) { uni.navigateTo({ url:`/pages/match/detail?id=${id}` }) }
  }
}
</script>
<style lang="scss">
.page{background:#f5f5f5;padding:20rpx;padding-bottom:80rpx}
.search-bar{background:#fff;border-radius:20rpx;padding:16rpx 24rpx;margin-bottom:20rpx}
.search-inp{width:100%;font-size:28rpx}
.match-item{background:#fff;border-radius:20rpx;padding:28rpx;margin-bottom:16rpx;display:flex;align-items:center;gap:16rpx;box-shadow:0 2rpx 10rpx rgba(0,0,0,.05)}
.mi-icon{font-size:40rpx}
.mi-name{display:block;font-size:30rpx;font-weight:bold;color:#1a1a1a;margin-bottom:6rpx}
.mi-info{font-size:22rpx;color:#888}
.badge{font-size:22rpx;padding:8rpx 18rpx;border-radius:8rpx}
.s-open{background:#e8f7ee;color:#1DB954}.s-ongoing{background:#1DB954;color:#fff}.s-finished{background:#f5f5f5;color:#999}
.empty{text-align:center;padding:80rpx 0;color:#aaa;font-size:28rpx}
</style>

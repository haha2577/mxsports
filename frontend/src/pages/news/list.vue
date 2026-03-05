<template>
  <view class="page">
    <view class="header" :style="`padding-top:${statusBarHeight + 12}px;background:${sport==='badminton'?'linear-gradient(145deg, #0a7a38, #1DB954, #25d366)':'linear-gradient(145deg, #8a3010, #d4541f, #e8712a)'}`">
      <view class="hd-row">
        <view class="back-btn" @tap="uni.navigateBack()">‹</view>
        <text class="hd-title">最新资讯</text>
      </view>
      <scroll-view scroll-x class="cat-scroll">
        <view class="cat-row">
          <view v-for="c in cats" :key="c"
                :class="['cat-tag', activeCat===c&&'cat-active']"
                @tap="activeCat=c">{{ c }}</view>
        </view>
      </scroll-view>
    </view>

    <view class="list">
      <view v-for="n in filteredNews" :key="n.id" class="news-item" @tap="goDetail(n.id)">
        <view class="ni-cover" :style="`background:${n.catColor}15`">
          <text class="ni-icon">{{ catIcon(n.cat) }}</text>
        </view>
        <view class="ni-body">
          <view :class="['ni-cat']" :style="`color:${n.catColor};background:${n.catColor}15`">{{ n.cat }}</view>
          <text class="ni-title">{{ n.title }}</text>
          <view class="ni-footer">
            <text class="ni-sport">{{ n.sport==='badminton'?'🏸 羽毛球':n.sport==='tennis'?'🎾 网球':'⚡ 综合' }}</text>
            <text class="ni-date">{{ n.date }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const ALL_NEWS = [
  { id:1, title:'2025羽毛球超级联赛报名通道正式开放',  cat:'赛事动态', catColor:'#1DB954', sport:'badminton', date:'03-04' },
  { id:2, title:'网球发球速度提升的5个实用技巧',        cat:'技术提升', catColor:'#1565c0', sport:'tennis',    date:'03-03' },
  { id:3, title:'2025春季最值得入手的羽毛球拍测评',    cat:'装备测评', catColor:'#f57c00', sport:'badminton', date:'03-02' },
  { id:4, title:'本地网球协会周末公开赛战报',           cat:'赛事动态', catColor:'#1DB954', sport:'tennis',    date:'03-01' },
  { id:5, title:'羽毛球双打站位战术详解',              cat:'技术提升', catColor:'#1565c0', sport:'badminton', date:'02-28' },
  { id:6, title:'新人必看：选择球拍的3个核心指标',     cat:'装备测评', catColor:'#f57c00', sport:'both',      date:'02-27' },
]
export default {
  data() { return { statusBarHeight:20, activeCat:'全部', cats:['全部','赛事动态','技术提升','装备测评'], news:ALL_NEWS } },
  computed: {
    filteredNews() { return this.activeCat==='全部' ? this.news : this.news.filter(n=>n.cat===this.activeCat) }
  },
  onLoad() { try { this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight||20 } catch(e){} },
  methods: {
    catIcon(c) { return {赛事动态:'🏆',技术提升:'💡',装备测评:'🎽'}[c]||'📰' },
    goDetail(id) { uni.navigateTo({ url:`/pages/news/detail?id=${id}` }) }
  }
}
</script>

<style lang="scss">
.page { background:#f0f2f5; padding-bottom:40rpx; }
.header {  padding:0 32rpx 0; }
.hd-row { display:flex; align-items:center; gap:16rpx; padding-bottom:20rpx; }
.back-btn { font-size:56rpx; color:#fff; width:60rpx; line-height:1; margin-top:-4rpx; }
.hd-title { font-size:36rpx; font-weight:bold; color:#fff; }
.cat-scroll { margin:0 -32rpx; padding:0 32rpx 20rpx; }
.cat-row { display:flex; gap:12rpx; }
.cat-tag { padding:12rpx 28rpx; background:rgba(255,255,255,.12); border:1rpx solid rgba(255,255,255,.2); border-radius:50rpx; font-size:26rpx; color:rgba(255,255,255,.7); flex-shrink:0; }
.cat-active { background:rgba(255,255,255,.9); color:#1a1a2e; font-weight:bold; border-color:transparent; }
.list { padding:20rpx 24rpx; display:flex; flex-direction:column; gap:16rpx; }
.news-item { background:#fff; border-radius:20rpx; display:flex; gap:0; overflow:hidden; box-shadow:0 4rpx 12rpx rgba(0,0,0,.06); }
.ni-cover { width:160rpx; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.ni-icon  { font-size:56rpx; }
.ni-body  { flex:1; padding:20rpx 20rpx 20rpx 16rpx; display:flex; flex-direction:column; gap:8rpx; }
.ni-cat   { display:inline-block; font-size:20rpx; padding:4rpx 14rpx; border-radius:50rpx; font-weight:500; align-self:flex-start; }
.ni-title { font-size:28rpx; font-weight:bold; color:#1a1a1a; line-height:1.5; }
.ni-footer { display:flex; justify-content:space-between; align-items:center; margin-top:4rpx; }
.ni-sport { font-size:22rpx; color:#888; }
.ni-date  { font-size:22rpx; color:#bbb; }
</style>

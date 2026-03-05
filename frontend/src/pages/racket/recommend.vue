<template>
  <view class="page">
    <view class="header" :style="`padding-top:${statusBarHeight+12}px;background:${sport==='badminton'?'linear-gradient(145deg,#0a7a38,#1DB954,#25d366)':'linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'}`">
      <view class="hd-row">
        <view class="back-btn" @tap="uni.navigateBack()">‹</view>
        <text class="hd-title">智能球拍推荐</text>
        <!-- 只有双栖才显示切换 -->
        <sport-switcher :sport-pref="sportPref" :active="sport" @switch="onSwitch"/>
      </view>
      <text class="hd-sub">根据你的水平和打法，精准匹配最适合的球拍</text>
    </view>

    <!-- 当前运动标识 -->
    <view class="sport-banner">
      <text class="sb-emoji">{{ sport==='badminton'?'🏸':'🎾' }}</text>
      <text class="sb-name">{{ sport==='badminton'?'羽毛球拍推荐':'网球拍推荐' }}</text>
    </view>

    <!-- 测试题入口 -->
    <view class="quiz-card" @tap="startQuiz">
      <view class="qc-left">
        <text class="qc-title">开始测评</text>
        <text class="qc-sub">3分钟找到你的专属球拍</text>
      </view>
      <view class="qc-arrow">›</view>
    </view>

    <!-- 推荐列表 -->
    <view class="section-title">热门推荐</view>
    <view class="racket-list">
      <view v-for="r in rackets" :key="r.id" class="racket-card" @tap="goDetail(r.id)">
        <view class="rc-cover">
          <text class="rc-icon">{{ sport==='badminton'?'🏸':'🎾' }}</text>
        </view>
        <view class="rc-body">
          <text class="rc-name">{{ r.name }}</text>
          <view class="rc-tags">
            <view v-for="t in r.tags" :key="t" class="rc-tag">{{ t }}</view>
          </view>
          <view class="rc-footer">
            <text class="rc-price">¥{{ r.price }}</text>
            <view class="rc-level">{{ r.level }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SportSwitcher from '../../components/SportSwitcher.vue'

const RACKETS = {
  badminton: [
    { id:1, name:'尤尼克斯 Astrox 99 Pro', price:1680, level:'高级',  tags:['头重','进攻型','碳纤维'] },
    { id:2, name:'李宁 N90 III',            price:980,  level:'中级',  tags:['均衡型','全碳素','轻量'] },
    { id:3, name:'胜利 Thruster K 1',       price:760,  level:'业余',  tags:['头轻','防守型','弹性好'] },
    { id:4, name:'川崎 Black Hole 20',      price:480,  level:'入门',  tags:['均衡型','耐用','性价比'] },
  ],
  tennis: [
    { id:5, name:'Wilson Pro Staff RF97',   price:2200, level:'高级',  tags:['控制型','重拍','精准'] },
    { id:6, name:'Head Gravity MP',         price:1500, level:'中级',  tags:['均衡型','旋转','舒适'] },
    { id:7, name:'Babolat Pure Drive',      price:1380, level:'业余',  tags:['力量型','弹性好','进攻'] },
    { id:8, name:'Prince Beast 100',        price:890,  level:'入门',  tags:['轻量','易上手','耐用'] },
  ],
}

export default {
  components: { SportSwitcher },
  data() {
    return {
      statusBarHeight: 20,
      sport: uni.getStorageSync('activeSport') || 'badminton',
      sportPref: uni.getStorageSync('sportPref') || '',
    }
  },
  computed: {
    rackets() { return RACKETS[this.sport] || [] }
  },
  onLoad() {
    try { this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20 } catch(e) {}
  },
  methods: {
    onSwitch(s) { this.sport = s; uni.setStorageSync('activeSport', s) },
    startQuiz() { uni.showToast({ title: '测评功能开发中', icon: 'none' }) },
    goDetail(id) { uni.showToast({ title: '详情页开发中', icon: 'none' }) },
  }
}
</script>

<style lang="scss">
.page { background: #f0f2f5; padding-bottom: 40rpx; }
.header { padding: 0 32rpx 32rpx; }
.hd-row { display: flex; align-items: center; gap: 16rpx; margin-bottom: 12rpx; }
.back-btn { font-size: 56rpx; color: #fff; width: 60rpx; line-height: 1; margin-top: -4rpx; }
.hd-title { flex: 1; font-size: 36rpx; font-weight: bold; color: #fff; }
.hd-sub { font-size: 24rpx; color: rgba(255,255,255,.7); }

.sport-banner { display: flex; align-items: center; gap: 12rpx; margin: 24rpx 24rpx 0; background: #fff; border-radius: 20rpx; padding: 24rpx 28rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,.05); }
.sb-emoji { font-size: 40rpx; }
.sb-name  { font-size: 30rpx; font-weight: bold; color: #1a1a1a; }

.quiz-card { margin: 16rpx 24rpx 0; background: #1a1a2e; border-radius: 20rpx; padding: 32rpx 28rpx; display: flex; justify-content: space-between; align-items: center; }
.qc-title { display: block; font-size: 32rpx; font-weight: bold; color: #fff; margin-bottom: 6rpx; }
.qc-sub   { font-size: 24rpx; color: rgba(255,255,255,.6); }
.qc-arrow { font-size: 48rpx; color: rgba(255,255,255,.4); }

.section-title { font-size: 22rpx; color: #aaa; padding: 24rpx 32rpx 12rpx; letter-spacing: 1rpx; font-weight: 600; }
.racket-list { padding: 0 24rpx; display: flex; flex-direction: column; gap: 16rpx; }
.racket-card { background: #fff; border-radius: 20rpx; display: flex; overflow: hidden; box-shadow: 0 4rpx 12rpx rgba(0,0,0,.05); }
.rc-cover { width: 140rpx; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
.rc-icon  { font-size: 60rpx; opacity: .5; }
.rc-body  { flex: 1; padding: 24rpx; }
.rc-name  { display: block; font-size: 28rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 12rpx; }
.rc-tags  { display: flex; gap: 8rpx; flex-wrap: wrap; margin-bottom: 16rpx; }
.rc-tag   { font-size: 20rpx; background: #f0f0f0; color: #555; padding: 4rpx 14rpx; border-radius: 50rpx; }
.rc-footer { display: flex; justify-content: space-between; align-items: center; }
.rc-price  { font-size: 32rpx; font-weight: bold; color: #e53935; }
.rc-level  { font-size: 20rpx; background: #fff8e1; color: #f57c00; padding: 4rpx 16rpx; border-radius: 50rpx; }
</style>

<template>
  <view class="page">

    <!-- 顶部 -->
    <view class="header" :style="`padding-top:${statusBarHeight + 12}px;background:${activeSport==='badminton'?'linear-gradient(145deg, #0a7a38, #1DB954, #25d366)':'linear-gradient(145deg, #8a3010, #d4541f, #e8712a)'}`">
      <view class="hd-row">
        <sport-switcher :sport-pref="sportPref" :active="sport" @switch="s=>{sport=s}"/>
      </view>

      <!-- 状态 Tab -->
      <view class="status-tabs">
        <view v-for="t in tabs" :key="t.value"
              :class="['stab', activeTab===t.value && 'stab-active']"
              @tap="activeTab=t.value">
          {{ t.label }}
          <text v-if="countOf(t.value)" class="stab-count">{{ countOf(t.value) }}</text>
        </view>
      </view>
    </view>

    <!-- 列表 -->
    <view v-if="!filteredList.length" class="empty-wrap">
      <text class="empty-icon">{{ sport==='badminton'?'🏸':'🎾' }}</text>
      <text class="empty-title">暂无活动</text>
      <text class="empty-sub">去约球或报名参赛吧</text>
      <view class="empty-btn" @tap="uni.switchTab({url:'/pages/home/index'})">去看看</view>
    </view>

    <view v-else class="list">
      <view v-for="m in filteredList" :key="m.id" class="activity-card" @tap="goDetail(m)">

        <!-- 左侧色条 -->
        <view :class="['card-bar', m.sport==='badminton'?'bar-b':'bar-t']"/>

        <view class="card-body">
          <!-- 顶部行 -->
          <view class="card-top">
            <text class="card-title">{{ m.name }}</text>
            <view :class="['status-pill', 'sp-'+m.status]">{{ statusLabel(m.status) }}</view>
          </view>

          <!-- 信息 -->
          <view class="card-info">
            <text class="ci">📍 {{ m.location }}</text>
            <text class="ci">🗓️ {{ m.date }} {{ m.time }}</text>
          </view>

          <!-- 标签行 -->
          <view class="card-tags">
            <view :class="['sport-tag', m.sport==='badminton'?'tag-b':'tag-t']">
              {{ m.sport==='badminton'?'🏸 羽毛球':'🎾 网球' }}
            </view>
            <view class="role-tag">{{ m.role==='organizer'?'🎤 发起人':'🙋 参与者' }}</view>
            <view v-if="m.result" :class="['result-tag', m.result==='win'?'tag-win':'tag-lose']">
              {{ m.result==='win'?'🏆 胜':'😤 负' }}
            </view>
          </view>

          <!-- 底部行 -->
          <view class="card-footer">
            <text class="cf-people">👥 {{ m.joined }}/{{ m.maxPlayers }} 人</text>
            <view v-if="m.status==='ongoing'" class="action-sm" @tap.stop="goDetail(m)">查看详情 ›</view>
            <view v-else-if="m.status==='open'" class="action-sm cancel-sm" @tap.stop="cancelJoin(m)">取消报名</view>
            <view v-else-if="m.status==='done'" class="action-sm" @tap.stop="goReview(m)">
              {{ m.reviewed ? '查看评价' : '写评价' }}
            </view>
          </view>
        </view>

      </view>
    </view>

  </view>
</template>

<script>
import SportSwitcher from '../../components/SportSwitcher.vue'
import { MY_ACTIVITIES } from '../../store/mockData.js'

export default {
  components: { SportSwitcher },
  watch: {
    sport(s) { this.list = MY_ACTIVITIES[s] || [] }
  },
  data() {
    return {
      statusBarHeight: 20,
      sport: uni.getStorageSync('activeSport') || 'badminton',
      sportPref: uni.getStorageSync('sportPref') || '',
      activeTab: 'all',
      list: MY_ACTIVITIES[this.sport] || [],
      tabs: [
        { label: '全部',   value: 'all' },
        { label: '进行中', value: 'ongoing' },
        { label: '已完成', value: 'done' },
      ]
    }
  },
  computed: {
    filteredList() {
      return this.list.filter(m => {
        const sportOk = !this.sport || m.sport === this.sport
        const tabOk = this.activeTab === 'all' ? true
          : this.activeTab === 'ongoing' ? ['open','ongoing'].includes(m.status)
          : m.status === 'done'
        return sportOk && tabOk
      })
    }
  },
  onLoad() {
    try { this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20 } catch(e) {}
    this.sportPref = uni.getStorageSync('sportPref') || ''
  },
  methods: {
    countOf(tab) {
      return this.list.filter(m => {
        const sportOk = !this.sport || m.sport === this.sport
        const tabOk = tab === 'all' ? true
          : tab === 'ongoing' ? ['open','ongoing'].includes(m.status)
          : m.status === 'done'
        return sportOk && tabOk
      }).length
    },
    statusLabel(s) {
      return { open:'报名中', ongoing:'进行中', done:'已完成', cancelled:'已取消' }[s] || s
    },
    goDetail(m) { uni.navigateTo({ url: `/pages/match/detail?id=${m.id}` }) },
    goReview(m) { uni.showToast({ title: '评价功能开发中', icon: 'none' }) },
    cancelJoin(m) {
      uni.showModal({ title:'取消报名', content:'确定要取消报名吗？', success: r => {
        if (r.confirm) { m.status = 'cancelled'; uni.showToast({ title:'已取消报名', icon:'success' }) }
      }})
    }
  }
}
</script>

<style lang="scss">
.page { background: #f0f2f5; padding-bottom: 60rpx; }

.header {  padding: 0 32rpx 0; }
.hd-row { display: flex; align-items: center; gap: 16rpx; padding-bottom: 24rpx; }
.back-btn { font-size: 56rpx; color: #fff; width: 60rpx; line-height: 1; margin-top: -4rpx; }
.hd-title { flex: 1; font-size: 36rpx; font-weight: bold; color: #fff; }

.status-tabs { display: flex; border-top: 1rpx solid rgba(255,255,255,.1); }
.stab { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; color: rgba(255,255,255,.5); position: relative; display: flex; align-items: center; justify-content: center; gap: 8rpx; }
.stab-active { color: #fff; font-weight: bold; }
.stab-active::after { content: ''; position: absolute; bottom: 0; left: 20%; right: 20%; height: 4rpx; background: #fff; border-radius: 2rpx; }
.stab-count { background: rgba(255,255,255,.2); color: #fff; font-size: 20rpx; padding: 2rpx 12rpx; border-radius: 50rpx; }
.stab-active .stab-count { background: rgba(255,255,255,.9); color: #1a1a2e; }

.empty-wrap { display: flex; flex-direction: column; align-items: center; padding: 100rpx 60rpx; }
.empty-icon  { font-size: 90rpx; margin-bottom: 20rpx; }
.empty-title { font-size: 34rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
.empty-sub   { font-size: 26rpx; color: #999; margin-bottom: 40rpx; }
.empty-btn   { background: #1a1a2e; color: #fff; font-size: 28rpx; padding: 20rpx 48rpx; border-radius: 50rpx; }

.list { padding: 20rpx 24rpx; display: flex; flex-direction: column; gap: 16rpx; }
.activity-card { background: #fff; border-radius: 24rpx; overflow: hidden; display: flex; box-shadow: 0 4rpx 16rpx rgba(0,0,0,.06); }
.card-bar { width: 8rpx; flex-shrink: 0; }
.bar-b { background: linear-gradient(180deg, #1DB954, #0a7a38); }
.bar-t { background: linear-gradient(180deg, #d4541f, #8a3010); }

.card-body  { flex: 1; padding: 24rpx 24rpx 24rpx 20rpx; }
.card-top   { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12rpx; gap: 12rpx; }
.card-title { font-size: 30rpx; font-weight: bold; color: #1a1a1a; flex: 1; }

.status-pill  { font-size: 20rpx; padding: 6rpx 16rpx; border-radius: 50rpx; flex-shrink: 0; }
.sp-open      { background: #e8f7ee; color: #1DB954; }
.sp-ongoing   { background: #1a1a2e; color: #fff; }
.sp-done      { background: #f0f0f0; color: #999; }
.sp-cancelled { background: #fff0f0; color: #e53935; }

.card-info { margin-bottom: 16rpx; }
.ci { display: block; font-size: 24rpx; color: #888; margin-bottom: 6rpx; }

.card-tags  { display: flex; gap: 10rpx; flex-wrap: wrap; margin-bottom: 16rpx; }
.sport-tag  { font-size: 20rpx; padding: 4rpx 16rpx; border-radius: 50rpx; }
.tag-b      { background: #e8f7ee; color: #1DB954; }
.tag-t      { background: #fdf0e8; color: #d4541f; }
.role-tag   { font-size: 20rpx; padding: 4rpx 16rpx; border-radius: 50rpx; background: #e8f0fd; color: #1565c0; }
.result-tag { font-size: 20rpx; padding: 4rpx 16rpx; border-radius: 50rpx; }
.tag-win    { background: #fff8e1; color: #f57c00; }
.tag-lose   { background: #f5f5f5; color: #999; }

.card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1rpx solid #f5f5f5; padding-top: 16rpx; }
.cf-people   { font-size: 24rpx; color: #aaa; }
.action-sm   { font-size: 24rpx; color: #1a1a2e; font-weight: 500; padding: 8rpx 20rpx; background: #f0f2f5; border-radius: 50rpx; }
.cancel-sm   { color: #e53935; background: #fff0f0; }
</style>

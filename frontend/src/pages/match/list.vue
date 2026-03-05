<template>
  <view class="page">

    <!-- 顶部 -->
    <view class="header" :style="`padding-top:${statusBarHeight + 12}px;background:${activeSport==='badminton'?'linear-gradient(145deg, #0a7a38, #1DB954, #25d366)':'linear-gradient(145deg, #8a3010, #d4541f, #e8712a)'}`">
      <view class="hd-row">
        <view class="back-btn" @tap="$router?$router.back():uni.navigateBack()">‹</view>
        <text class="hd-title">附近的约球</text>
        <sport-switcher :sport-pref="sportPref" :active="sport" @switch="onSportSwitch"/>
      </view>

      <!-- 搜索框 -->
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="keyword" placeholder="搜索地点、活动名称" confirm-type="search" @confirm="doSearch"/>
        <view v-if="keyword" class="search-clear" @tap="keyword='';doSearch()">×</view>
      </view>

      <!-- 筛选 chips -->
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-row">
          <view :class="['chip', filterArea&&'chip-active']"    @tap="openFilter('area')">
            📍 {{ filterArea || '地区' }}
            <text class="chip-arrow">▾</text>
          </view>
          <view :class="['chip', filterTime&&'chip-active']"    @tap="openFilter('time')">
            🗓️ {{ timeLabel || '时间' }}
            <text class="chip-arrow">▾</text>
          </view>
          <view :class="['chip', filterLevel&&'chip-active']"   @tap="openFilter('level')">
            ⭐ {{ levelLabel || '水平' }}
            <text class="chip-arrow">▾</text>
          </view>
          <view :class="['chip', filterFee!==''&&'chip-active']" @tap="openFilter('fee')">
            💰 {{ feeLabel || '费用' }}
            <text class="chip-arrow">▾</text>
          </view>
          <view v-if="hasFilter" class="chip chip-reset" @tap="resetFilter">✕ 清除</view>
        </view>
      </scroll-view>
    </view>

    <!-- 结果数 -->
    <view class="result-bar" v-if="!loading">
      <text class="result-txt">共 {{ list.length }} 个约球</text>
      <view class="sort-btn" @tap="toggleSort">
        <text class="sort-txt">{{ sortLabel }}</text>
        <text class="sort-icon">⇅</text>
      </view>
    </view>

    <!-- 列表 -->
    <view v-if="loading" class="loading-wrap">
      <text class="loading-txt">定位中，获取附近约球…</text>
    </view>
    <view v-else-if="!list.length" class="empty-wrap">
      <text class="empty-icon">{{ sport === 'badminton' ? '🏸' : '🎾' }}</text>
      <text class="empty-title">附近暂无约球活动</text>
      <text class="empty-sub">换个筛选条件试试，或发起一场约球</text>
      <view class="empty-btn" @tap="goCreate">+ 发起约球</view>
    </view>
    <view v-else class="list">
      <view v-for="m in sortedList" :key="m.id" class="match-card" @tap="goDetail(m.id)">
        <!-- 顶部：运动类型 + 状态 -->
        <view class="mc-top">
          <view :class="['sport-tag', m.sport==='badminton'?'tag-b':'tag-t']">
            {{ m.sport === 'badminton' ? '🏸 羽毛球' : '🎾 网球' }}
          </view>
          <text :class="['status-dot', `s-${m.status}`]">{{ statusLabel(m.status) }}</text>
        </view>
        <!-- 标题 -->
        <text class="mc-title">{{ m.name }}</text>
        <!-- 信息行 -->
        <view class="mc-info-row">
          <view class="mc-info"><text class="info-icon">📍</text><text class="info-txt">{{ m.location }}</text></view>
          <view class="mc-info"><text class="info-icon">📏</text><text class="info-txt">{{ m.distance }}</text></view>
        </view>
        <view class="mc-info-row">
          <view class="mc-info"><text class="info-icon">🗓️</text><text class="info-txt">{{ m.date }}</text></view>
          <view class="mc-info"><text class="info-icon">⏰</text><text class="info-txt">{{ m.time }}</text></view>
        </view>
        <!-- 水平 + 人数 + 费用 -->
        <view class="mc-tags">
          <view class="mt-tag level-tag">⭐ {{ m.level }}</view>
          <view class="mt-tag people-tag">👥 {{ m.joined }}/{{ m.maxPlayers }}人</view>
          <view class="mt-tag fee-tag">💰 {{ m.fee > 0 ? m.fee+'元/人' : '免费' }}</view>
        </view>
        <!-- 底部：发起人 + 报名按钮 -->
        <view class="mc-footer">
          <view class="organizer">
            <view class="org-avatar"><text class="org-av-txt">{{ m.organizer[0] }}</text></view>
            <text class="org-name">{{ m.organizer }} 发起</text>
          </view>
          <view :class="['join-btn', m.status!=='open'&&'join-btn-disabled']">
            {{ m.status === 'open' ? '报名参加' : '已截止' }}
          </view>
        </view>
      </view>
    </view>

    <!-- 悬浮发起按钮 -->
    <view class="fab" @tap="goCreate">
      <text class="fab-icon">＋</text>
      <text class="fab-txt">发起约球</text>
    </view>

    <!-- 筛选弹窗 -->
    <view v-if="activeFilter" class="filter-sheet-wrap">
      <view class="filter-mask" @tap="activeFilter=null"/>
      <view class="filter-sheet">
        <view class="fs-handle"/>

        <!-- 地区 -->
        <view v-if="activeFilter==='area'">
          <text class="fs-title">📍 选择地区</text>
          <view class="fs-grid">
            <view v-for="a in areas" :key="a"
                  :class="['fg-item', filterArea===a&&'fg-active']"
                  @tap="filterArea = filterArea===a?'':a">{{ a }}</view>
          </view>
        </view>

        <!-- 时间 -->
        <view v-if="activeFilter==='time'">
          <text class="fs-title">🗓️ 选择时间</text>
          <view class="fs-list">
            <view v-for="t in timeOptions" :key="t.value"
                  :class="['fl-item', filterTime===t.value&&'fl-active']"
                  @tap="filterTime = filterTime===t.value?'':t.value">
              <text class="fl-label">{{ t.label }}</text>
              <text v-if="filterTime===t.value" class="fl-check">✓</text>
            </view>
          </view>
        </view>

        <!-- 水平 -->
        <view v-if="activeFilter==='level'">
          <text class="fs-title">⭐ 选择水平</text>
          <view class="fs-list">
            <view v-for="l in levelOptions" :key="l.value"
                  :class="['fl-item', filterLevel===l.value&&'fl-active']"
                  @tap="filterLevel = filterLevel===l.value?'':l.value">
              <view>
                <text class="fl-label">{{ l.label }}</text>
                <text class="fl-desc">{{ l.desc }}</text>
              </view>
              <text v-if="filterLevel===l.value" class="fl-check">✓</text>
            </view>
          </view>
        </view>

        <!-- 费用 -->
        <view v-if="activeFilter==='fee'">
          <text class="fs-title">💰 费用范围</text>
          <view class="fs-list">
            <view v-for="f in feeOptions" :key="f.value"
                  :class="['fl-item', filterFee===f.value&&'fl-active']"
                  @tap="filterFee = filterFee===f.value?'':f.value">
              <text class="fl-label">{{ f.label }}</text>
              <text v-if="filterFee===f.value" class="fl-check">✓</text>
            </view>
          </view>
        </view>

        <view class="fs-btns">
          <view class="fs-reset" @tap="resetCurrent">重置</view>
          <view class="fs-confirm" @tap="applyFilter">确定</view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
import SportSwitcher from '../../components/SportSwitcher.vue'

const MOCK = [
  { id:1, name:'周末羽毛球约战', sport:'badminton', location:'朝阳区体育馆', distance:'1.2km', date:'3月6日(周四)', time:'19:00-21:00', level:'业余', joined:3, maxPlayers:8, fee:30, status:'open', organizer:'王小明' },
  { id:2, name:'网球双打约球', sport:'tennis', location:'海淀网球中心', distance:'2.8km', date:'3月7日(周五)', time:'08:00-10:00', level:'中级', joined:2, maxPlayers:4, fee:50, status:'open', organizer:'李梅' },
  { id:3, name:'羽毛球内部赛', sport:'badminton', location:'国贸体育中心', distance:'4.5km', date:'3月5日(周三)', time:'18:30-21:30', level:'高级', joined:6, maxPlayers:6, fee:0, status:'full', organizer:'张伟' },
  { id:4, name:'网球初学者训练', sport:'tennis', location:'望京网球馆', distance:'3.1km', date:'3月8日(周六)', time:'10:00-12:00', level:'入门', joined:1, maxPlayers:6, fee:20, status:'open', organizer:'陈欣' },
]

export default {
  components: { SportSwitcher },
  data() {
    return {
      statusBarHeight: 20,
      sport: 'badminton',
      keyword: '',
      filterArea: '', filterTime: '', filterLevel: '', filterFee: '',
      sortMode: 'distance',
      loading: false,
      list: [...MOCK],
      activeFilter: null,
      areas: ['朝阳区','海淀区','西城区','东城区','丰台区','通州区','顺义区','昌平区'],
      timeOptions: [
        { label:'今天', value:'today' },
        { label:'明天', value:'tomorrow' },
        { label:'本周末', value:'weekend' },
        { label:'未来7天', value:'7days' },
        { label:'未来30天', value:'30days' },
      ],
      levelOptions: [
        { label:'入门', value:'入门', desc:'刚开始接触，以玩为主' },
        { label:'业余', value:'业余', desc:'会基本动作，打过一段时间' },
        { label:'中级', value:'中级', desc:'技术较稳定，有一定战术意识' },
        { label:'高级', value:'高级', desc:'技术全面，有比赛经验' },
        { label:'不限', value:'',    desc:'任意水平均可参加' },
      ],
      feeOptions: [
        { label:'免费', value:'free' },
        { label:'50元以内', value:'50' },
        { label:'50-100元', value:'100' },
        { label:'100元以上', value:'200' },
      ],
    }
  },
  computed: {
    hasFilter() { return !!(this.filterArea || this.filterTime || this.filterLevel || this.filterFee !== '') },
    timeLabel()  { return this.timeOptions.find(t=>t.value===this.filterTime)?.label || '' },
    levelLabel() { return this.filterLevel },
    feeLabel()   { return this.feeOptions.find(f=>f.value===this.filterFee)?.label || '' },
    sortLabel()  { return this.sortMode === 'distance' ? '距离优先' : '时间最近' },
    filteredList() {
      let l = this.list.filter(m => {
        if (this.sport && m.sport !== this.sport) return false
        if (this.keyword && !m.name.includes(this.keyword) && !m.location.includes(this.keyword)) return false
        if (this.filterArea && !m.location.includes(this.filterArea)) return false
        if (this.filterLevel && m.level !== this.filterLevel) return false
        if (this.filterFee === 'free' && m.fee !== 0) return false
        if (this.filterFee === '50'  && m.fee > 50)  return false
        if (this.filterFee === '100' && (m.fee <= 50 || m.fee > 100)) return false
        if (this.filterFee === '200' && m.fee <= 100) return false
        return true
      })
      return l
    },
    sortedList() {
      return [...this.filteredList].sort((a,b) => {
        if (this.sortMode === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
        return 0
      })
    }
  },
  onLoad(options) {
    try { this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20 } catch(e) {}
    this.sportPref = uni.getStorageSync('sportPref') || ''
    if (options.sport) this.sport = options.sport
  },
  methods: {
    onSportSwitch(s) { this.sport = s; uni.setStorageSync('activeSport', s) },
    doSearch() { /* 触发 computed 自动过滤 */ },
    toggleSort() { this.sortMode = this.sortMode === 'distance' ? 'time' : 'distance' },
    openFilter(type) { this.activeFilter = type },
    resetCurrent() {
      if (this.activeFilter === 'area')  this.filterArea  = ''
      if (this.activeFilter === 'time')  this.filterTime  = ''
      if (this.activeFilter === 'level') this.filterLevel = ''
      if (this.activeFilter === 'fee')   this.filterFee   = ''
    },
    applyFilter() { this.activeFilter = null },
    resetFilter() { this.filterArea=''; this.filterTime=''; this.filterLevel=''; this.filterFee='' },
    statusLabel(s) { return { open:'报名中', full:'已满员', finished:'已结束' }[s] || s },
    goDetail(id) { uni.navigateTo({ url: `/pages/match/detail?id=${id}` }) },
    goCreate()   { uni.navigateTo({ url: '/pages/match/create' }) },
  }
}
</script>

<style lang="scss">
.page { background: #f0f2f5; padding-bottom: 120rpx; }

/* ── 顶部 ── */
.header {  padding: 0 32rpx 0; }
.hd-row { display: flex; align-items: center; gap: 16rpx; padding-bottom: 20rpx; }
.back-btn { font-size: 56rpx; color: #fff; width: 60rpx; line-height: 1; margin-top: -4rpx; }
.hd-title { flex: 1; font-size: 36rpx; font-weight: bold; color: #fff; }

.search-bar { background: rgba(255,255,255,.12); border-radius: 20rpx; display: flex; align-items: center; padding: 0 20rpx; margin-bottom: 20rpx; border: 1rpx solid rgba(255,255,255,.15); }
.search-icon  { font-size: 30rpx; margin-right: 12rpx; }
.search-input { flex: 1; height: 72rpx; font-size: 28rpx; color: #fff; }
.search-input::placeholder { color: rgba(255,255,255,.4); }
.search-clear { font-size: 36rpx; color: rgba(255,255,255,.5); padding: 0 8rpx; }

.filter-scroll { margin: 0 -32rpx; padding: 0 32rpx 24rpx; }
.filter-row { display: flex; gap: 12rpx; white-space: nowrap; }
.chip { display: inline-flex; align-items: center; gap: 8rpx; padding: 12rpx 24rpx; background: rgba(255,255,255,.12); border: 1rpx solid rgba(255,255,255,.2); border-radius: 50rpx; font-size: 24rpx; color: rgba(255,255,255,.8); flex-shrink: 0; }
.chip-active { background: rgba(255,255,255,.9); color: #1a1a2e; font-weight: bold; border-color: transparent; }
.chip-arrow { font-size: 20rpx; opacity: .6; }
.chip-reset { background: rgba(220,53,69,.2); border-color: rgba(220,53,69,.3); color: #ff8080; }

/* ── 结果栏 ── */
.result-bar { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 32rpx; }
.result-txt { font-size: 24rpx; color: #999; }
.sort-btn { display: flex; align-items: center; gap: 6rpx; }
.sort-txt { font-size: 24rpx; color: #555; }
.sort-icon { font-size: 26rpx; color: #aaa; }

/* ── 状态 ── */
.loading-wrap { padding: 80rpx; text-align: center; }
.loading-txt  { font-size: 28rpx; color: #aaa; }
.empty-wrap { display: flex; flex-direction: column; align-items: center; padding: 80rpx 60rpx; }
.empty-icon  { font-size: 90rpx; margin-bottom: 20rpx; }
.empty-title { font-size: 34rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
.empty-sub   { font-size: 26rpx; color: #999; text-align: center; margin-bottom: 40rpx; }
.empty-btn   { background: #1a1a2e; color: #fff; font-size: 28rpx; padding: 20rpx 48rpx; border-radius: 50rpx; }

/* ── 卡片 ── */
.list { padding: 0 24rpx; display: flex; flex-direction: column; gap: 20rpx; }
.match-card { background: #fff; border-radius: 24rpx; padding: 28rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,.06); }
.mc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14rpx; }
.sport-tag { font-size: 22rpx; padding: 6rpx 18rpx; border-radius: 50rpx; font-weight: 500; }
.tag-b { background: #e8f7ee; color: #1DB954; }
.tag-t { background: #fdf0e8; color: #d4541f; }
.status-dot { font-size: 22rpx; padding: 6rpx 18rpx; border-radius: 50rpx; }
.s-open     { background: #e8f7ee; color: #1DB954; }
.s-full     { background: #f0f0f0; color: #999; }
.s-finished { background: #f0f0f0; color: #bbb; }

.mc-title { display: block; font-size: 34rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 16rpx; }
.mc-info-row { display: flex; gap: 32rpx; margin-bottom: 10rpx; }
.mc-info { display: flex; align-items: center; gap: 8rpx; }
.info-icon { font-size: 24rpx; }
.info-txt  { font-size: 24rpx; color: #666; }

.mc-tags { display: flex; gap: 10rpx; flex-wrap: wrap; margin: 16rpx 0; }
.mt-tag  { font-size: 22rpx; padding: 6rpx 18rpx; border-radius: 50rpx; }
.level-tag  { background: #fff8e1; color: #f57c00; }
.people-tag { background: #e8f4fd; color: #1565c0; }
.fee-tag    { background: #f3e5f5; color: #7b1fa2; }

.mc-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1rpx solid #f5f5f5; padding-top: 20rpx; margin-top: 4rpx; }
.organizer { display: flex; align-items: center; gap: 12rpx; }
.org-avatar { width: 48rpx; height: 48rpx; background: linear-gradient(145deg,#1a1a2e,#0f3460); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.org-av-txt { font-size: 22rpx; color: #fff; font-weight: bold; }
.org-name   { font-size: 24rpx; color: #888; }
.join-btn   { background: #1a1a2e; color: #fff; font-size: 26rpx; padding: 14rpx 32rpx; border-radius: 50rpx; }
.join-btn-disabled { background: #e0e0e0; color: #999; }

/* ── FAB ── */
.fab { position: fixed; bottom: 48rpx; right: 32rpx; background: #1a1a2e; border-radius: 50rpx; padding: 22rpx 36rpx; display: flex; align-items: center; gap: 10rpx; box-shadow: 0 8rpx 28rpx rgba(26,26,46,.35); z-index: 100; }
.fab-icon { font-size: 36rpx; color: #fff; line-height: 1; }
.fab-txt  { font-size: 28rpx; color: #fff; font-weight: 500; }

/* ── 筛选弹窗 ── */
.filter-sheet-wrap { position: fixed; inset: 0; z-index: 300; }
.filter-mask  { position: absolute; inset: 0; background: rgba(0,0,0,.5); }
.filter-sheet { position: absolute; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 32rpx 32rpx 0 0; padding: 24rpx 40rpx 60rpx; max-height: 80vh; overflow-y: auto; }
.fs-handle { width: 60rpx; height: 8rpx; background: #e0e0e0; border-radius: 4rpx; margin: 0 auto 32rpx; }
.fs-title  { display: block; font-size: 34rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 28rpx; }

.fs-grid { display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 40rpx; }
.fg-item { padding: 16rpx 28rpx; background: #f5f5f5; border-radius: 50rpx; font-size: 28rpx; color: #555; border: 2rpx solid transparent; }
.fg-active { background: #e8ecf5; border-color: #1a1a2e; color: #1a1a2e; font-weight: bold; }

.fs-list { display: flex; flex-direction: column; gap: 4rpx; margin-bottom: 40rpx; }
.fl-item { display: flex; justify-content: space-between; align-items: center; padding: 24rpx; border-radius: 16rpx; background: #f8f8f8; border: 2rpx solid transparent; }
.fl-active { background: #e8ecf5; border-color: #1a1a2e; }
.fl-label { display: block; font-size: 30rpx; color: #1a1a1a; font-weight: 500; }
.fl-desc  { display: block; font-size: 22rpx; color: #aaa; margin-top: 4rpx; }
.fl-check { font-size: 32rpx; color: #1a1a2e; font-weight: bold; }

.fs-btns { display: flex; gap: 16rpx; }
.fs-reset   { flex: 1; height: 88rpx; line-height: 88rpx; text-align: center; background: #f5f5f5; border-radius: 50rpx; font-size: 30rpx; color: #555; }
.fs-confirm { flex: 2; height: 88rpx; line-height: 88rpx; text-align: center; background: #1a1a2e; border-radius: 50rpx; font-size: 30rpx; color: #fff; font-weight: 500; }
</style>

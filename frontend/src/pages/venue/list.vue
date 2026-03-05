<template>
  <view class="page">

    <!-- 顶部 -->
    <view class="header" :style="`padding-top:${statusBarHeight + 12}px;background:${activeSport==='badminton'?'linear-gradient(145deg, #0a7a38, #1DB954, #25d366)':'linear-gradient(145deg, #8a3010, #d4541f, #e8712a)'}`">
      <view class="hd-row">
        <view class="back-btn" @tap="uni.navigateBack()">‹</view>
        <text class="hd-title">附近场馆</text>
        <sport-switcher :sport-pref="sportPref" :active="sport" @switch="s=>{sport=s;loadVenues()}"/>
      </view>

      <!-- 定位行 -->
      <view class="location-bar" @tap="chooseCity">
        <text class="loc-icon">📍</text>
        <text class="loc-city">{{ city }}</text>
        <text class="loc-arrow">▾</text>
        <view class="loc-divider"/>
        <view class="loc-search" @tap.stop="showSearch=true">
          <text class="ls-icon">🔍</text>
          <text class="ls-txt">搜索场馆名称、地址</text>
        </view>
      </view>

      <!-- 筛选 chips -->
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-row">
          <view :class="['chip', filterType&&'chip-active']" @tap="openFilter('type')">
            🏟️ {{ filterType || '场馆类型' }} <text class="chip-arrow">▾</text>
          </view>
          <view :class="['chip', filterDist&&'chip-active']" @tap="openFilter('dist')">
            📏 {{ distLabel || '距离' }} <text class="chip-arrow">▾</text>
          </view>
          <view :class="['chip', filterPrice&&'chip-active']" @tap="openFilter('price')">
            💰 {{ priceLabel || '价格' }} <text class="chip-arrow">▾</text>
          </view>
          <view :class="['chip', filterOpen&&'chip-active']" @tap="filterOpen=!filterOpen">
            🟢 {{ filterOpen ? '营业中 ✓' : '营业中' }}
          </view>
          <view v-if="hasFilter" class="chip chip-reset" @tap="resetAll">✕ 清除</view>
        </view>
      </scroll-view>
    </view>

    <!-- 视图切换 -->
    <view class="view-toggle">
      <text class="vt-count">找到 {{ filteredList.length }} 家场馆</text>
      <view class="vt-btns">
        <view :class="['vt-btn', viewMode==='list'&&'vt-active']" @tap="viewMode='list'">📋 列表</view>
        <view :class="['vt-btn', viewMode==='map'&&'vt-active']"  @tap="viewMode='map'">🗺️ 地图</view>
      </view>
    </view>

    <!-- 列表模式 -->
    <view v-if="viewMode==='list'" class="list">
      <view v-if="!filteredList.length" class="empty-wrap">
        <text class="empty-icon">🏟️</text>
        <text class="empty-title">附近暂无场馆</text>
        <text class="empty-sub">换个筛选条件或切换城市试试</text>
      </view>
      <view v-for="v in filteredList" :key="v.id" class="venue-card" @tap="goDetail(v.id)">
        <!-- 封面 -->
        <view class="vc-cover" :style="`background:${sport==='badminton'?'#e8f7ee':'#fdf0e8'}`">
          <text class="vc-cover-icon">{{ sport==='badminton'?'🏸':'🎾' }}</text>
          <view v-if="v.isOpen" class="open-badge">营业中</view>
          <view v-else class="closed-badge">已关闭</view>
        </view>
        <!-- 信息 -->
        <view class="vc-body">
          <view class="vc-top">
            <text class="vc-name">{{ v.name }}</text>
            <view class="vc-dist">📏 {{ v.distance }}</view>
          </view>
          <text class="vc-addr">📍 {{ v.address }}</text>
          <view class="vc-tags">
            <view v-for="t in v.tags" :key="t" class="vc-tag">{{ t }}</view>
          </view>
          <view class="vc-bottom">
            <view class="vc-price">
              <text class="price-from">¥</text>
              <text class="price-num">{{ v.priceFrom }}</text>
              <text class="price-unit">/小时起</text>
            </view>
            <view class="vc-rating">
              <text class="star">★</text>
              <text class="rating-num">{{ v.rating }}</text>
              <text class="rating-count">({{ v.reviewCount }})</text>
            </view>
            <view class="vc-book-btn" @tap.stop="goBook(v)">预约</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 地图模式（占位） -->
    <view v-else class="map-placeholder">
      <text class="mp-icon">🗺️</text>
      <text class="mp-txt">地图视图开发中</text>
      <text class="mp-sub">切换到列表模式查看附近场馆</text>
    </view>

    <!-- 筛选弹窗 -->
    <view v-if="activeFilter" class="filter-sheet-wrap">
      <view class="filter-mask" @tap="activeFilter=null"/>
      <view class="filter-sheet">
        <view class="fs-handle"/>

        <view v-if="activeFilter==='type'">
          <text class="fs-title">🏟️ 场馆类型</text>
          <view class="fs-grid">
            <view v-for="t in typeOptions" :key="t"
                  :class="['fg-item', filterType===t&&'fg-active']"
                  @tap="filterType = filterType===t?'':t">{{ t }}</view>
          </view>
        </view>

        <view v-if="activeFilter==='dist'">
          <text class="fs-title">📏 距离范围</text>
          <view class="fs-list">
            <view v-for="d in distOptions" :key="d.value"
                  :class="['fl-item', filterDist===d.value&&'fl-active']"
                  @tap="filterDist = filterDist===d.value?'':d.value">
              <text class="fl-label">{{ d.label }}</text>
              <text v-if="filterDist===d.value" class="fl-check">✓</text>
            </view>
          </view>
        </view>

        <view v-if="activeFilter==='price'">
          <text class="fs-title">💰 价格范围</text>
          <view class="fs-list">
            <view v-for="p in priceOptions" :key="p.value"
                  :class="['fl-item', filterPrice===p.value&&'fl-active']"
                  @tap="filterPrice = filterPrice===p.value?'':p.value">
              <text class="fl-label">{{ p.label }}</text>
              <text v-if="filterPrice===p.value" class="fl-check">✓</text>
            </view>
          </view>
        </view>

        <view class="fs-btns">
          <view class="fs-reset" @tap="resetCurrent">重置</view>
          <view class="fs-confirm" @tap="activeFilter=null">确定</view>
        </view>
      </view>
    </view>

    <!-- 选择城市弹窗 -->
    <view v-if="showCityPicker" class="filter-sheet-wrap">
      <view class="filter-mask" @tap="showCityPicker=false"/>
      <view class="filter-sheet">
        <view class="fs-handle"/>
        <text class="fs-title">📍 选择城市</text>
        <view class="fs-grid">
          <view v-for="c in cities" :key="c"
                :class="['fg-item', city===c&&'fg-active']"
                @tap="city=c;showCityPicker=false;loadVenues()">{{ c }}</view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
import SportSwitcher from '../../components/SportSwitcher.vue'

const MOCK_VENUES = [
  { id:1, name:'朝阳体育馆',     address:'朝阳区朝阳路88号',     distance:'1.2km', priceFrom:60,  rating:4.8, reviewCount:234, isOpen:true,  tags:['室内','停车场','更衣室'] },
  { id:2, name:'国贸网球中心',   address:'朝阳区建国路1号',       distance:'2.1km', priceFrom:120, rating:4.9, reviewCount:189, isOpen:true,  tags:['专业场地','灯光场','教练'] },
  { id:3, name:'海淀体育馆',     address:'海淀区中关村大街1号',   distance:'3.4km', priceFrom:50,  rating:4.6, reviewCount:312, isOpen:false, tags:['室内','空调','停车场'] },
  { id:4, name:'望京运动公园',   address:'朝阳区望京街10号',      distance:'3.8km', priceFrom:40,  rating:4.5, reviewCount:156, isOpen:true,  tags:['室外','免费停车'] },
  { id:5, name:'亚运村羽毛球馆', address:'朝阳区北辰路2号',       distance:'4.2km', priceFrom:80,  rating:4.7, reviewCount:98,  isOpen:true,  tags:['专业场地','更衣室','淋浴'] },
]

export default {
  components: { SportSwitcher },
  data() {
    return {
      statusBarHeight: 20,
      sport: uni.getStorageSync('activeSport') || 'badminton',
      sportPref: uni.getStorageSync('sportPref') || '',
      city: '北京',
      viewMode: 'list',
      filterType: '', filterDist: '', filterPrice: '', filterOpen: false,
      activeFilter: null,
      showCityPicker: false,
      showSearch: false,
      venues: [...MOCK_VENUES],
      typeOptions: ['室内场馆','室外场地','专业球馆','社区场馆','学校场馆'],
      distOptions: [
        { label:'1km以内',  value:'1' },
        { label:'3km以内',  value:'3' },
        { label:'5km以内',  value:'5' },
        { label:'10km以内', value:'10' },
      ],
      priceOptions: [
        { label:'50元以内/小时',  value:'50' },
        { label:'50-100元/小时', value:'100' },
        { label:'100元以上/小时', value:'200' },
      ],
      cities: ['北京','上海','广州','深圳','成都','杭州','武汉','南京','西安','重庆'],
    }
  },
  computed: {
    hasFilter() { return !!(this.filterType || this.filterDist || this.filterPrice || this.filterOpen) },
    distLabel()  { return this.distOptions.find(d=>d.value===this.filterDist)?.label||'' },
    priceLabel() { return this.priceOptions.find(p=>p.value===this.filterPrice)?.label||'' },
    filteredList() {
      return this.venues.filter(v => {
        if (this.filterOpen && !v.isOpen) return false
        if (this.filterDist && parseFloat(v.distance) > parseFloat(this.filterDist)) return false
        if (this.filterPrice === '50'  && v.priceFrom > 50)  return false
        if (this.filterPrice === '100' && (v.priceFrom <= 50 || v.priceFrom > 100)) return false
        if (this.filterPrice === '200' && v.priceFrom <= 100) return false
        return true
      })
    }
  },
  onLoad(opts) {
    try { this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20 } catch(e) {}
    this.sportPref = uni.getStorageSync('sportPref') || ''
    if (opts.sport) this.sport = opts.sport
  },
  methods: {
    loadVenues() { /* TODO: 调后端 */ },
    chooseCity() { this.showCityPicker = true },
    openFilter(t) { this.activeFilter = t },
    resetCurrent() {
      if (this.activeFilter==='type')  this.filterType  = ''
      if (this.activeFilter==='dist')  this.filterDist  = ''
      if (this.activeFilter==='price') this.filterPrice = ''
    },
    resetAll() { this.filterType=''; this.filterDist=''; this.filterPrice=''; this.filterOpen=false },
    goDetail(id) { uni.navigateTo({ url:`/pages/venue/detail?id=${id}` }) },
    goBook(v) { uni.showToast({ title:'预约功能开发中', icon:'none' }) },
  }
}
</script>

<style lang="scss">
.page { background:#f0f2f5; padding-bottom:40rpx; }
.header {  padding:0 32rpx 0; }
.hd-row { display:flex; align-items:center; gap:16rpx; padding-bottom:20rpx; }
.back-btn { font-size:56rpx; color:#fff; width:60rpx; line-height:1; margin-top:-4rpx; }
.hd-title { flex:1; font-size:36rpx; font-weight:bold; color:#fff; }

.location-bar { display:flex; align-items:center; background:rgba(255,255,255,.12); border:1rpx solid rgba(255,255,255,.15); border-radius:20rpx; padding:0 20rpx; height:72rpx; margin-bottom:20rpx; }
.loc-icon  { font-size:28rpx; margin-right:8rpx; }
.loc-city  { font-size:28rpx; color:#fff; font-weight:500; }
.loc-arrow { font-size:20rpx; color:rgba(255,255,255,.5); margin:0 16rpx 0 6rpx; }
.loc-divider { width:1rpx; height:30rpx; background:rgba(255,255,255,.2); margin-right:16rpx; }
.loc-search { flex:1; display:flex; align-items:center; gap:10rpx; }
.ls-icon { font-size:26rpx; opacity:.6; }
.ls-txt  { font-size:26rpx; color:rgba(255,255,255,.4); }

.filter-scroll { margin:0 -32rpx; padding:0 32rpx 20rpx; }
.filter-row { display:flex; gap:12rpx; white-space:nowrap; }
.chip { display:inline-flex; align-items:center; gap:6rpx; padding:12rpx 22rpx; background:rgba(255,255,255,.12); border:1rpx solid rgba(255,255,255,.2); border-radius:50rpx; font-size:24rpx; color:rgba(255,255,255,.8); flex-shrink:0; }
.chip-active { background:rgba(255,255,255,.9); color:#1a1a2e; font-weight:bold; border-color:transparent; }
.chip-arrow { font-size:18rpx; opacity:.6; }
.chip-reset { background:rgba(220,53,69,.2); border-color:rgba(220,53,69,.3); color:#ff8080; }

.view-toggle { display:flex; justify-content:space-between; align-items:center; padding:16rpx 32rpx; }
.vt-count { font-size:24rpx; color:#999; }
.vt-btns  { display:flex; background:#e8e8e8; border-radius:50rpx; padding:4rpx; gap:4rpx; }
.vt-btn   { padding:10rpx 24rpx; border-radius:50rpx; font-size:24rpx; color:#888; }
.vt-active { background:#fff; color:#1a1a2e; font-weight:500; box-shadow:0 2rpx 8rpx rgba(0,0,0,.1); }

.list { padding:0 24rpx; display:flex; flex-direction:column; gap:16rpx; }
.empty-wrap { display:flex; flex-direction:column; align-items:center; padding:80rpx 40rpx; }
.empty-icon  { font-size:80rpx; margin-bottom:16rpx; }
.empty-title { font-size:32rpx; font-weight:bold; color:#333; margin-bottom:8rpx; }
.empty-sub   { font-size:24rpx; color:#999; }

.venue-card { background:#fff; border-radius:24rpx; overflow:hidden; box-shadow:0 4rpx 16rpx rgba(0,0,0,.06); }
.vc-cover { height:180rpx; display:flex; align-items:center; justify-content:center; position:relative; }
.vc-cover-icon { font-size:80rpx; opacity:.5; }
.open-badge   { position:absolute; top:16rpx; left:16rpx; background:#1DB954; color:#fff; font-size:20rpx; padding:6rpx 18rpx; border-radius:50rpx; }
.closed-badge { position:absolute; top:16rpx; left:16rpx; background:#999; color:#fff; font-size:20rpx; padding:6rpx 18rpx; border-radius:50rpx; }

.vc-body { padding:24rpx; }
.vc-top  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10rpx; }
.vc-name { font-size:32rpx; font-weight:bold; color:#1a1a1a; flex:1; }
.vc-dist { font-size:22rpx; color:#888; background:#f5f5f5; padding:4rpx 14rpx; border-radius:50rpx; flex-shrink:0; }
.vc-addr { display:block; font-size:24rpx; color:#888; margin-bottom:16rpx; }
.vc-tags { display:flex; gap:10rpx; flex-wrap:wrap; margin-bottom:20rpx; }
.vc-tag  { font-size:20rpx; color:#555; background:#f0f0f0; padding:4rpx 16rpx; border-radius:50rpx; }
.vc-bottom { display:flex; align-items:center; border-top:1rpx solid #f5f5f5; padding-top:20rpx; }
.vc-price  { flex:1; display:flex; align-items:baseline; gap:4rpx; }
.price-from { font-size:22rpx; color:#e53935; }
.price-num  { font-size:40rpx; font-weight:bold; color:#e53935; }
.price-unit { font-size:20rpx; color:#aaa; }
.vc-rating  { display:flex; align-items:center; gap:4rpx; margin-right:24rpx; }
.star       { font-size:26rpx; color:#ffc107; }
.rating-num { font-size:26rpx; font-weight:bold; color:#333; }
.rating-count { font-size:20rpx; color:#aaa; }
.vc-book-btn { background:#1a1a2e; color:#fff; font-size:26rpx; padding:16rpx 36rpx; border-radius:50rpx; }

.map-placeholder { display:flex; flex-direction:column; align-items:center; padding:100rpx 40rpx; }
.mp-icon { font-size:100rpx; margin-bottom:20rpx; }
.mp-txt  { font-size:32rpx; font-weight:bold; color:#333; margin-bottom:10rpx; }
.mp-sub  { font-size:26rpx; color:#aaa; }

.filter-sheet-wrap { position:fixed; inset:0; z-index:300; }
.filter-mask  { position:absolute; inset:0; background:rgba(0,0,0,.5); }
.filter-sheet { position:absolute; bottom:0; left:0; right:0; background:#fff; border-radius:32rpx 32rpx 0 0; padding:24rpx 40rpx 60rpx; max-height:80vh; overflow-y:auto; }
.fs-handle { width:60rpx; height:8rpx; background:#e0e0e0; border-radius:4rpx; margin:0 auto 32rpx; }
.fs-title  { display:block; font-size:34rpx; font-weight:bold; color:#1a1a1a; margin-bottom:28rpx; }
.fs-grid   { display:flex; flex-wrap:wrap; gap:16rpx; margin-bottom:40rpx; }
.fg-item   { padding:16rpx 28rpx; background:#f5f5f5; border-radius:50rpx; font-size:28rpx; color:#555; border:2rpx solid transparent; }
.fg-active { background:#e8ecf5; border-color:#1a1a2e; color:#1a1a2e; font-weight:bold; }
.fs-list   { display:flex; flex-direction:column; gap:4rpx; margin-bottom:40rpx; }
.fl-item   { display:flex; justify-content:space-between; align-items:center; padding:24rpx; border-radius:16rpx; background:#f8f8f8; border:2rpx solid transparent; }
.fl-active { background:#e8ecf5; border-color:#1a1a2e; }
.fl-label  { font-size:30rpx; color:#1a1a1a; font-weight:500; }
.fl-check  { font-size:32rpx; color:#1a1a2e; font-weight:bold; }
.fs-btns   { display:flex; gap:16rpx; }
.fs-reset  { flex:1; height:88rpx; line-height:88rpx; text-align:center; background:#f5f5f5; border-radius:50rpx; font-size:30rpx; color:#555; }
.fs-confirm { flex:2; height:88rpx; line-height:88rpx; text-align:center; background:#1a1a2e; border-radius:50rpx; font-size:30rpx; color:#fff; font-weight:500; }
</style>

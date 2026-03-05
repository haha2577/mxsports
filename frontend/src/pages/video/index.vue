<template>
  <view class="page">

    <!-- 顶部 -->
    <view class="header" :style="`padding-top:${statusBarHeight + 12}px;background:${activeSport==='badminton'?'linear-gradient(145deg, #0a7a38, #1DB954, #25d366)':'linear-gradient(145deg, #8a3010, #d4541f, #e8712a)'}`">
      <view class="hd-top">
        <text class="hd-title">我的视频</text>
        <view class="upload-btn" @tap="chooseVideo">
          <text class="upload-icon">＋</text>
          <text class="upload-txt">上传</text>
        </view>
      </view>
      <!-- 运动切换（双栖选手） -->
      <sport-switcher :sport-pref="sportPref" :active="filterSport==='all'?'badminton':filterSport" @switch="s=>{ filterSport=s }" style="margin-bottom:16rpx"/>
      <!-- 运动筛选 -->
      <view class="filter-row">
        <view :class="['filter-tag', filterSport==='all'&&'filter-active']" @tap="filterSport='all'">全部</view>
        <view :class="['filter-tag', filterSport==='badminton'&&'filter-active']" @tap="filterSport='badminton'">🏸 羽毛球</view>
        <view :class="['filter-tag', filterSport==='tennis'&&'filter-active']" @tap="filterSport='tennis'">🎾 网球</view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!filteredList.length" class="empty-wrap">
      <text class="empty-icon">🎬</text>
      <text class="empty-title">还没有视频</text>
      <text class="empty-sub">上传你的打球视频，解锁智能剪辑和 AI 评价</text>
      <view class="empty-btn" @tap="chooseVideo">上传第一个视频</view>
    </view>

    <!-- 视频列表 -->
    <view v-else class="list">
      <view v-for="v in filteredList" :key="v.id" class="video-card" @tap="openVideo(v)">
        <!-- 封面 -->
        <view class="thumb-wrap">
          <image v-if="v.thumbnail" :src="v.thumbnail" class="thumb" mode="aspectFill"/>
          <view v-else class="thumb-placeholder">
            <text class="thumb-icon">{{ v.sport === 'badminton' ? '🏸' : '🎾' }}</text>
          </view>
          <!-- 时长 -->
          <view class="duration-tag">{{ v.duration }}</view>
          <!-- 状态角标 -->
          <view v-if="v.status !== 'done'" :class="['status-badge', `status-${v.status}`]">
            {{ statusLabel(v.status) }}
          </view>
          <!-- 播放按钮 -->
          <view v-if="v.status === 'done'" class="play-btn">▶</view>
        </view>
        <!-- 信息 -->
        <view class="card-body">
          <text class="card-title">{{ v.title }}</text>
          <view class="card-meta">
            <text class="meta-sport">{{ v.sport === 'badminton' ? '🏸 羽毛球' : '🎾 网球' }}</text>
            <text class="meta-date">{{ v.date }}</text>
          </view>
          <!-- 功能按钮 -->
          <view v-if="v.status === 'done'" class="card-actions">
            <view class="action-chip ai-clip" @tap.stop="doClip(v)">
              <text class="chip-icon">✂️</text>
              <text class="chip-txt">智能剪辑</text>
            </view>
            <view class="action-chip ai-eval" @tap.stop="doEval(v)">
              <text class="chip-icon">🤖</text>
              <text class="chip-txt">AI 评价</text>
            </view>
            <view class="action-chip share-chip" @tap.stop="doShare(v)">
              <text class="chip-icon">📤</text>
              <text class="chip-txt">分享</text>
            </view>
          </view>
          <!-- 处理中进度 -->
          <view v-else-if="v.status === 'processing'" class="processing-bar">
            <view class="pb-fill" :style="`width:${v.progress||30}%`"/>
          </view>
        </view>
      </view>
    </view>

    <!-- 上传进度浮窗 -->
    <view v-if="uploading" class="upload-toast">
      <text class="ut-icon">📤</text>
      <view class="ut-info">
        <text class="ut-title">正在上传...</text>
        <view class="ut-bar"><view class="ut-fill" :style="`width:${uploadProgress}%`"/></view>
      </view>
      <text class="ut-pct">{{ uploadProgress }}%</text>
    </view>

    <!-- AI 功能详情弹窗 -->
    <view v-if="activeSheet" class="sheet-wrap">
      <view class="sheet-mask" @tap="activeSheet=null"/>
      <view class="sheet" :class="{'sheet-show': !!activeSheet}">
        <view class="sheet-handle"/>

        <!-- 智能剪辑 -->
        <view v-if="activeSheet==='clip'">
          <text class="sheet-title">✂️ 智能剪辑</text>
          <text class="sheet-sub">AI 自动识别精彩片段，帮你剪出高光集锦</text>
          <view class="clip-options">
            <view :class="['clip-opt', clipMode==='auto'&&'clip-opt-active']" @tap="clipMode='auto'">
              <text class="co-icon">⚡</text>
              <text class="co-title">全自动剪辑</text>
              <text class="co-desc">AI 根据动作强度和击球声自动选取</text>
            </view>
            <view :class="['clip-opt', clipMode==='person'&&'clip-opt-active']" @tap="clipMode='person'">
              <text class="co-icon">🎯</text>
              <text class="co-title">指定人物剪辑</text>
              <text class="co-desc">只保留包含你的片段</text>
            </view>
          </view>
          <view class="sheet-row">
            <text class="sr-label">集锦时长</text>
            <view class="duration-opts">
              <view v-for="d in ['30s','1分钟','3分钟','全部精彩']" :key="d"
                    :class="['dur-opt', clipDuration===d&&'dur-opt-active']" @tap="clipDuration=d">
                {{ d }}
              </view>
            </view>
          </view>
          <view class="sheet-btn primary-btn" @tap="startClip">开始生成集锦</view>
        </view>

        <!-- AI 评价 -->
        <view v-if="activeSheet==='eval'">
          <text class="sheet-title">🤖 AI 评价</text>
          <text class="sheet-sub">分析你的动作、战术和体能表现</text>
          <view class="eval-cards">
            <view class="eval-card" @tap="startEval('action')">
              <text class="ec-icon">💪</text>
              <text class="ec-title">动作分析</text>
              <text class="ec-desc">挥拍姿势、步伐节奏、击球点</text>
              <text class="ec-badge">即将上线</text>
            </view>
            <view class="eval-card" @tap="startEval('tactic')">
              <text class="ec-icon">🧠</text>
              <text class="ec-title">战术建议</text>
              <text class="ec-desc">落点分布、进攻/防守比例</text>
              <text class="ec-badge">即将上线</text>
            </view>
            <view class="eval-card" @tap="startEval('highlight')">
              <text class="ec-icon">⭐</text>
              <text class="ec-title">表现评分</text>
              <text class="ec-desc">综合评价本场表现，给出成长建议</text>
              <text class="ec-badge">即将上线</text>
            </view>
          </view>
        </view>

      </view>
    </view>

  </view>
</template>

<script>
import SportSwitcher from '../../components/SportSwitcher.vue'
// Mock 数据（对接后端后替换）
const mockVideos = [
  { id: 1, title: '周末羽毛球双打', sport: 'badminton', duration: '1:23:45', date: '03-02', status: 'done', thumbnail: '', progress: 100 },
  { id: 2, title: '网球训练赛', sport: 'tennis', duration: '0:45:00', date: '03-01', status: 'processing', thumbnail: '', progress: 65 },
]

export default {
  components: { SportSwitcher },
  data() {
    return {
      statusBarHeight: 20,
      activeSport: uni.getStorageSync('activeSport') || 'badminton',
      videos: [...mockVideos],
      uploading: false,
      uploadProgress: 0,
      activeSheet: null,
      activeVideo: null,
      clipMode: 'auto',
      clipDuration: '1分钟',
    }
  },
  computed: {
    filteredList() {
      return this.videos.filter(v => v.sport === this.activeSport)
    }
  },
  onLoad() {
    try { this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20 } catch(e) {}
    this.sportPref   = uni.getStorageSync('sportPref') || ''
    this.activeSport = uni.getStorageSync('activeSport') || 'badminton'
  },
  methods: {
    onSportSwitch(s) {
      this.activeSport = s
      this.filterSport = s
      uni.setStorageSync('activeSport', s)
    },
    statusLabel(s) {
      return { uploading: '上传中', processing: 'AI处理中', error: '失败' }[s] || ''
    },
    chooseVideo() {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 7200,
        success: (res) => { this.uploadVideo(res) },
        fail: () => {}
      })
    },
    uploadVideo(file) {
      // TODO: 实际上传逻辑
      this.uploading = true
      this.uploadProgress = 0
      const timer = setInterval(() => {
        this.uploadProgress += 10
        if (this.uploadProgress >= 100) {
          clearInterval(timer)
          this.uploading = false
          this.videos.unshift({
            id: Date.now(), title: '新视频 ' + new Date().toLocaleDateString(),
            sport: uni.getStorageSync('activeSport') || 'badminton',
      sportPref: uni.getStorageSync('sportPref') || '',
            duration: '--:--', date: new Date().toLocaleDateString().slice(5),
            status: 'processing', thumbnail: '', progress: 10
          })
          uni.showToast({ title: '上传成功，AI 处理中', icon: 'none' })
        }
      }, 200)
    },
    openVideo(v) {
      if (v.status !== 'done') return
      // TODO: 视频播放
      uni.showToast({ title: '播放功能开发中', icon: 'none' })
    },
    doClip(v) { this.activeVideo = v; this.activeSheet = 'clip' },
    doEval(v) { this.activeVideo = v; this.activeSheet = 'eval' },
    doShare(v) { uni.showToast({ title: '分享功能开发中', icon: 'none' }) },
    startClip() {
      uni.showToast({ title: '正在生成集锦，完成后通知你', icon: 'none' })
      this.activeSheet = null
    },
    startEval(type) {
      uni.showToast({ title: '即将上线，敬请期待', icon: 'none' })
    },
  }
}
</script>

<style lang="scss">
.page { background: #f0f2f5; padding-bottom: 40rpx; }

/* ── 顶部 ── */
.header {  padding: 0 32rpx 28rpx; }
.hd-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.hd-title { display: block; font-size: 40rpx; font-weight: bold; color: #fff; margin-bottom: 16rpx; }
.hd-title { font-size: 44rpx; font-weight: bold; color: #fff; }
.upload-btn { display: flex; align-items: center; gap: 8rpx; background: rgba(255,255,255,.15); border: 1rpx solid rgba(255,255,255,.25); border-radius: 50rpx; padding: 14rpx 28rpx; }
.upload-icon { font-size: 36rpx; color: #fff; line-height: 1; }
.upload-txt  { font-size: 26rpx; color: #fff; font-weight: 500; }

.filter-row { display: flex; gap: 12rpx; }
.filter-tag { padding: 10rpx 24rpx; border-radius: 50rpx; font-size: 24rpx; color: rgba(255,255,255,.6); background: rgba(255,255,255,.1); border: 1rpx solid rgba(255,255,255,.15); }
.filter-active { background: rgba(255,255,255,.9); color: #1a1a2e; font-weight: bold; }

/* ── 空状态 ── */
.empty-wrap { display: flex; flex-direction: column; align-items: center; padding: 100rpx 60rpx; }
.empty-icon  { font-size: 100rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 36rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
.empty-sub   { font-size: 26rpx; color: #999; text-align: center; line-height: 1.6; margin-bottom: 48rpx; }
.empty-btn   { background: #1a1a2e; color: #fff; font-size: 30rpx; padding: 24rpx 60rpx; border-radius: 50rpx; }

/* ── 视频列表 ── */
.list { padding: 20rpx 24rpx; display: flex; flex-direction: column; gap: 20rpx; }
.video-card { background: #fff; border-radius: 24rpx; overflow: hidden; box-shadow: 0 4rpx 16rpx rgba(0,0,0,.07); }

.thumb-wrap { position: relative; height: 300rpx; background: #1a1a2e; }
.thumb { width: 100%; height: 100%; }
.thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(145deg, #1a1a2e, #0f3460); }
.thumb-icon { font-size: 100rpx; opacity: .4; }
.duration-tag { position: absolute; bottom: 12rpx; right: 12rpx; background: rgba(0,0,0,.6); color: #fff; font-size: 22rpx; padding: 6rpx 16rpx; border-radius: 8rpx; }
.status-badge { position: absolute; top: 12rpx; left: 12rpx; font-size: 22rpx; padding: 6rpx 18rpx; border-radius: 50rpx; font-weight: 500; }
.status-uploading  { background: #fff3cd; color: #856404; }
.status-processing { background: #d1ecf1; color: #0c5460; }
.status-error      { background: #f8d7da; color: #721c24; }
.play-btn { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 80rpx; color: rgba(255,255,255,.85); }

.card-body  { padding: 24rpx 28rpx; }
.card-title { display: block; font-size: 32rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 10rpx; }
.card-meta  { display: flex; gap: 20rpx; margin-bottom: 20rpx; }
.meta-sport { font-size: 22rpx; color: #888; }
.meta-date  { font-size: 22rpx; color: #bbb; }

.card-actions { display: flex; gap: 12rpx; flex-wrap: wrap; }
.action-chip { display: flex; align-items: center; gap: 8rpx; padding: 12rpx 22rpx; border-radius: 50rpx; }
.ai-clip   { background: #e8f4fd; }
.ai-eval   { background: #f0e8fd; }
.share-chip { background: #e8f7ee; }
.chip-icon { font-size: 26rpx; }
.chip-txt  { font-size: 24rpx; color: #333; font-weight: 500; }

.processing-bar { height: 8rpx; background: #f0f0f0; border-radius: 4rpx; overflow: hidden; }
.pb-fill { height: 100%; background: linear-gradient(90deg, #1a1a2e, #0f3460); border-radius: 4rpx; transition: width .5s; }

/* ── 上传浮窗 ── */
.upload-toast { position: fixed; bottom: 120rpx; left: 24rpx; right: 24rpx; background: #fff; border-radius: 20rpx; padding: 24rpx 28rpx; display: flex; align-items: center; gap: 16rpx; box-shadow: 0 8rpx 32rpx rgba(0,0,0,.15); z-index: 200; }
.ut-icon { font-size: 48rpx; }
.ut-info { flex: 1; }
.ut-title { display: block; font-size: 26rpx; font-weight: 500; color: #333; margin-bottom: 8rpx; }
.ut-bar  { height: 6rpx; background: #f0f0f0; border-radius: 3rpx; overflow: hidden; }
.ut-fill { height: 100%; background: #1a1a2e; border-radius: 3rpx; transition: width .2s; }
.ut-pct  { font-size: 26rpx; font-weight: bold; color: #1a1a2e; }

/* ── 功能弹窗 ── */
.sheet-wrap { position: fixed; inset: 0; z-index: 300; }
.sheet-mask { position: absolute; inset: 0; background: rgba(0,0,0,.5); }
.sheet { position: absolute; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 32rpx 32rpx 0 0; padding: 24rpx 40rpx 60rpx; transform: translateY(100%); transition: transform .3s cubic-bezier(.4,0,.2,1); }
.sheet-show { transform: translateY(0); }
.sheet-handle { width: 60rpx; height: 8rpx; background: #e0e0e0; border-radius: 4rpx; margin: 0 auto 32rpx; }
.sheet-title { display: block; font-size: 40rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 8rpx; }
.sheet-sub   { display: block; font-size: 26rpx; color: #aaa; margin-bottom: 36rpx; }

/* 智能剪辑 */
.clip-options { display: flex; flex-direction: column; gap: 16rpx; margin-bottom: 32rpx; }
.clip-opt { background: #f8f8f8; border-radius: 20rpx; padding: 28rpx; border: 3rpx solid transparent; display: flex; flex-direction: column; gap: 6rpx; }
.clip-opt-active { border-color: #1a1a2e; background: #f0f2f5; }
.co-icon  { font-size: 40rpx; }
.co-title { font-size: 30rpx; font-weight: bold; color: #1a1a1a; }
.co-desc  { font-size: 24rpx; color: #888; }
.sheet-row { margin-bottom: 32rpx; }
.sr-label  { display: block; font-size: 26rpx; color: #888; margin-bottom: 16rpx; }
.duration-opts { display: flex; gap: 12rpx; flex-wrap: wrap; }
.dur-opt { padding: 12rpx 28rpx; background: #f0f0f0; border-radius: 50rpx; font-size: 26rpx; color: #555; border: 2rpx solid transparent; }
.dur-opt-active { background: #e8ecf0; border-color: #1a1a2e; color: #1a1a2e; font-weight: bold; }
.sheet-btn { text-align: center; border-radius: 50rpx; height: 96rpx; line-height: 96rpx; font-size: 32rpx; font-weight: 500; }
.primary-btn { background: #1a1a2e; color: #fff; }

/* AI 评价 */
.eval-cards { display: flex; flex-direction: column; gap: 16rpx; }
.eval-card { background: #f8f8f8; border-radius: 20rpx; padding: 28rpx; display: flex; flex-direction: column; gap: 6rpx; position: relative; }
.ec-icon  { font-size: 40rpx; }
.ec-title { font-size: 30rpx; font-weight: bold; color: #1a1a1a; }
.ec-desc  { font-size: 24rpx; color: #888; }
.ec-badge { position: absolute; top: 20rpx; right: 24rpx; background: #fff3cd; color: #856404; font-size: 20rpx; padding: 4rpx 16rpx; border-radius: 50rpx; }
</style>

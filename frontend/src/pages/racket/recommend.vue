<template>
  <view class="page">
    <!-- 顶部 Hero -->
    <view class="hero">
      <text class="hero-title">🏸🎾 球拍推荐</text>
      <text class="hero-sub">告诉我们你的情况，找到最适合你的球拍</text>
    </view>

    <!-- 筛选表单 -->
    <view class="form-card">
      <!-- 运动类型 -->
      <view class="field">
        <text class="label">🏅 运动类型</text>
        <view class="opts">
          <view :class="['opt', form.sport==='badminton'?'opt-active-green':'']" @tap="form.sport='badminton'">🏸 羽毛球</view>
          <view :class="['opt', form.sport==='tennis'?'opt-active-orange':'']"   @tap="form.sport='tennis'">🎾 网球</view>
        </view>
      </view>

      <!-- 性别 -->
      <view class="field">
        <text class="label">👤 性别</text>
        <view class="opts">
          <view v-for="g in genders" :key="g.k" :class="['opt', form.gender===g.k?'opt-active':'']" @tap="form.gender=g.k">{{ g.l }}</view>
        </view>
      </view>

      <!-- 水平 -->
      <view class="field">
        <text class="label">⭐ 技术水平</text>
        <view class="opts">
          <view v-for="s in skills" :key="s.k" :class="['opt', form.skill===s.k?'opt-active':'']" @tap="form.skill=s.k">{{ s.l }}</view>
        </view>
      </view>

      <!-- 身高 -->
      <view class="field">
        <view class="field-row">
          <text class="label">📏 身高</text>
          <text class="field-val">{{ form.height }} cm</text>
        </view>
        <slider :value="form.height" :min="140" :max="210" :step="1" @change="form.height=$event.detail.value"
          :activeColor="accentColor" block-size="24" />
        <view class="slider-tips"><text>140</text><text>210</text></view>
      </view>

      <!-- 体重 -->
      <view class="field">
        <view class="field-row">
          <text class="label">⚖️ 体重</text>
          <text class="field-val">{{ form.weight }} kg</text>
        </view>
        <slider :value="form.weight" :min="35" :max="120" :step="1" @change="form.weight=$event.detail.value"
          :activeColor="accentColor" block-size="24" />
        <view class="slider-tips"><text>35</text><text>120</text></view>
      </view>

      <!-- 年龄 -->
      <view class="field">
        <view class="field-row">
          <text class="label">🎂 年龄</text>
          <text class="field-val">{{ form.age }} 岁</text>
        </view>
        <slider :value="form.age" :min="8" :max="80" :step="1" @change="form.age=$event.detail.value"
          :activeColor="accentColor" block-size="24" />
        <view class="slider-tips"><text>8</text><text>80</text></view>
      </view>

      <!-- 预算 -->
      <view class="field">
        <text class="label">💰 预算上限（可不选）</text>
        <view class="budget-opts">
          <view v-for="b in budgets" :key="b.v" :class="['budget-opt', form.budget===b.v?'budget-active':'']" @tap="form.budget = form.budget===b.v ? '' : b.v">
            <text class="b-label">{{ b.l }}</text>
            <text class="b-price">¥{{ b.v }}</text>
          </view>
        </view>
      </view>

      <!-- 品牌偏好 -->
      <view class="field">
        <text class="label">🏷️ 品牌偏好（可不选）</text>
        <view class="brand-opts">
          <view v-for="b in brandList" :key="b" :class="['brand-opt', form.brand===b?'brand-active':'']"
            @tap="form.brand = form.brand===b?'':b">{{ b }}</view>
        </view>
      </view>

      <button :class="['search-btn', form.sport==='tennis'?'search-tennis':'']" @tap="search" :disabled="loading">
        {{ loading ? '搜索中...' : '🔍 为我推荐' }}
      </button>
    </view>

    <!-- 结果 -->
    <view v-if="searched">
      <view v-if="!results.length" class="empty-result">
        <text class="empty-icon">🤔</text>
        <text class="empty-text">没找到完全匹配的球拍</text>
        <text class="empty-sub">试试放宽预算或不限品牌</text>
      </view>
      <view v-else>
        <view class="result-header">
          <text class="result-count">找到 {{ results.length }} 款适合你的球拍</text>
        </view>
        <view v-for="r in results" :key="r.id" class="racket-card" @tap="showDetail(r)">
          <!-- 图片 -->
          <view class="card-img-wrap">
            <image :src="r.image" class="card-img" mode="aspectFit" :onerror="imgError" />
            <view class="card-brand-badge">{{ r.brand }}</view>
          </view>
          <!-- 信息 -->
          <view class="card-body">
            <view class="card-top">
              <view>
                <text class="card-model">{{ r.model }}</text>
                <view class="card-tags">
                  <text v-for="tag in r.tags" :key="tag" class="tag">{{ tag }}</text>
                </view>
              </view>
              <text class="card-price">¥{{ r.price }}</text>
            </view>
            <!-- 亮点 -->
            <view class="highlights">
              <view v-for="h in r.highlights" :key="h" class="highlight-row">
                <text class="hl-dot">✦</text>
                <text class="hl-txt">{{ h }}</text>
              </view>
            </view>
            <!-- 参数条 -->
            <view class="spec-row">
              <view class="spec-item">
                <text class="spec-v">{{ r.weight_g }}g</text>
                <text class="spec-l">重量</text>
              </view>
              <view class="spec-div"/>
              <view class="spec-item">
                <text class="spec-v">{{ r.balance_label.slice(0,2) }}</text>
                <text class="spec-l">平衡</text>
              </view>
              <view class="spec-div"/>
              <view class="spec-item">
                <text class="spec-v">{{ r.flex_label }}</text>
                <text class="spec-l">硬度</text>
              </view>
              <view class="spec-div"/>
              <view class="spec-item">
                <text class="spec-v">{{ r.skill_label }}</text>
                <text class="spec-l">水平</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view v-if="detail" class="modal-mask" @tap.self="detail=null">
      <view class="modal">
        <view class="modal-header">
          <text class="modal-title">{{ detail.brand }} {{ detail.model }}</text>
          <text class="modal-close" @tap="detail=null">✕</text>
        </view>
        <scroll-view scroll-y class="modal-body">
          <image :src="detail.image" class="detail-img" mode="aspectFit"/>
          <text class="detail-price">¥{{ detail.price }}</text>
          <text class="detail-desc">{{ detail.description }}</text>
          <view class="specs-table">
            <view class="spec-row2"><text class="sk">重量</text><text class="sv">{{ detail.weight_g }}g</text></view>
            <view class="spec-row2"><text class="sk">平衡点</text><text class="sv">{{ detail.balance_label }}</text></view>
            <view class="spec-row2"><text class="sk">硬度</text><text class="sv">{{ detail.flex_label }}</text></view>
            <view class="spec-row2"><text class="sk">拍杆材质</text><text class="sv">{{ detail.shaft_material }}</text></view>
            <view class="spec-row2"><text class="sk">框架材质</text><text class="sv">{{ detail.frame_material }}</text></view>
            <view class="spec-row2"><text class="sk">穿线张力</text><text class="sv">{{ detail.string_tension }}</text></view>
            <view v-if="detail.head_size_cm2" class="spec-row2"><text class="sk">拍框面积</text><text class="sv">{{ detail.head_size_cm2 }} cm²</text></view>
            <view v-if="detail.length_mm" class="spec-row2"><text class="sk">拍长</text><text class="sv">{{ detail.length_mm }} mm</text></view>
            <view class="spec-row2"><text class="sk">适合水平</text><text class="sv">{{ detail.skill_label }}</text></view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { api } from '../../api/index.js'
export default {
  data() {
    return {
      form: { sport:'badminton', gender:'unisex', skill:'', height:170, weight:65, age:25, budget:'', brand:'' },
      genders: [{k:'male',l:'👨 男'},{k:'female',l:'👩 女'},{k:'unisex',l:'🙋 不限'}],
      skills:  [{k:'beginner',l:'🌱 入门'},{k:'intermediate',l:'⚡ 进阶'},{k:'advanced',l:'🏆 专业'}],
      budgets: [{v:300,l:'学生党'},{v:600,l:'实惠'},{v:1000,l:'中端'},{v:1500,l:'高端'},{v:9999,l:'旗舰'}],
      results: [], loading: false, searched: false, detail: null,
    }
  },
  computed: {
    accentColor() { return this.form.sport==='tennis' ? '#d4541f' : '#1DB954' },
    brandList() {
      return this.form.sport==='badminton'
        ? ['Yonex','Victor','Li-Ning','Kawasaki']
        : ['Wilson','Babolat','Head','Yonex','Tecnifibre']
    }
  },
  methods: {
    async search() {
      this.loading = true
      try {
        const params = [
          `sport=${this.form.sport}`,
          `gender=${this.form.gender}`,
          `height=${this.form.height}`,
          `weight=${this.form.weight}`,
          `age=${this.form.age}`,
          ...(this.form.budget ? [`budget=${this.form.budget}`] : []),
          ...(this.form.skill ? [`skill=${this.form.skill}`] : []),
          ...(this.form.brand ? [`brand=${encodeURIComponent(this.form.brand)}`] : []),
        ]
        const r = await api.get(`/rackets/?${params.join('&')}`)
        this.results  = r.data?.list || []
        this.searched = true
        if (this.results.length) {
          setTimeout(() => uni.pageScrollTo({ scrollTop: 9999, duration: 300 }), 100)
        }
      } catch(e) { uni.showToast({ title: e.message, icon:'none' }) }
      this.loading = false
    },
    showDetail(r) { this.detail = r },
    imgError(e) { /* 图片加载失败时静默处理 */ }
  }
}
</script>

<style lang="scss">
.page { background:#f5f5f5; min-height:100vh; padding-bottom:100rpx; }
.hero { background:linear-gradient(135deg,#1a1a2e,#0f3460,#1a1a2e); padding:60rpx 40rpx 50rpx; text-align:center; }
.hero-title { display:block; font-size:46rpx; font-weight:bold; color:#fff; margin-bottom:14rpx; }
.hero-sub   { font-size:26rpx; color:rgba(255,255,255,.7); }

.form-card { margin:24rpx; background:#fff; border-radius:28rpx; padding:36rpx; box-shadow:0 8rpx 32rpx rgba(0,0,0,.08); }
.field { margin-bottom:36rpx; }
.field:last-of-type { margin-bottom:0; }
.label { display:block; font-size:28rpx; font-weight:600; color:#1a1a1a; margin-bottom:18rpx; }
.field-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:16rpx; }
.field-val { font-size:32rpx; font-weight:bold; color:#1DB954; }

.opts { display:flex; gap:16rpx; flex-wrap:wrap; }
.opt { padding:16rpx 30rpx; border-radius:50rpx; border:2rpx solid #e8e8e8; font-size:28rpx; color:#555; background:#f8f8f8; }
.opt-active       { background:#e8f7ee; border-color:#1DB954; color:#1DB954; font-weight:bold; }
.opt-active-green { background:#e8f7ee; border-color:#1DB954; color:#1DB954; font-weight:bold; }
.opt-active-orange{ background:#fff3e0; border-color:#d4541f; color:#d4541f; font-weight:bold; }

.slider-tips { display:flex; justify-content:space-between; font-size:22rpx; color:#aaa; margin-top:6rpx; }

.budget-opts { display:flex; gap:12rpx; flex-wrap:wrap; }
.budget-opt { flex:1; min-width:100rpx; padding:18rpx 10rpx; border-radius:16rpx; border:2rpx solid #eee; text-align:center; background:#f8f8f8; }
.budget-active { background:#fff8e8; border-color:#f5a623; }
.b-label { display:block; font-size:22rpx; color:#888; margin-bottom:4rpx; }
.b-price { display:block; font-size:26rpx; font-weight:bold; color:#f5a623; }

.brand-opts { display:flex; gap:12rpx; flex-wrap:wrap; }
.brand-opt { padding:14rpx 28rpx; border-radius:12rpx; border:2rpx solid #eee; font-size:26rpx; color:#555; background:#f8f8f8; }
.brand-active { background:#eef4ff; border-color:#4a90e2; color:#4a90e2; font-weight:bold; }

.search-btn { width:100%; background:#1DB954; color:#fff; border:none; border-radius:50rpx; height:96rpx; font-size:34rpx; font-weight:bold; margin-top:36rpx; }
.search-tennis { background:#d4541f; }

.result-header { padding:24rpx 24rpx 0; }
.result-count  { font-size:28rpx; color:#666; }

.racket-card { margin:16rpx 24rpx; background:#fff; border-radius:28rpx; overflow:hidden; box-shadow:0 6rpx 24rpx rgba(0,0,0,.08); }
.card-img-wrap { background:#f8f8f8; height:280rpx; position:relative; display:flex; align-items:center; justify-content:center; }
.card-img { width:100%; height:100%; }
.card-brand-badge { position:absolute; top:16rpx; left:16rpx; background:rgba(0,0,0,.6); color:#fff; font-size:22rpx; padding:8rpx 18rpx; border-radius:50rpx; }
.card-body { padding:28rpx; }
.card-top  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16rpx; }
.card-model{ display:block; font-size:34rpx; font-weight:bold; color:#1a1a1a; margin-bottom:10rpx; }
.card-tags { display:flex; gap:10rpx; flex-wrap:wrap; }
.tag { background:#f0f0f0; color:#666; font-size:22rpx; padding:6rpx 18rpx; border-radius:50rpx; }
.card-price { font-size:40rpx; font-weight:bold; color:#e53935; white-space:nowrap; }

.highlights { margin-bottom:20rpx; }
.highlight-row { display:flex; align-items:flex-start; gap:10rpx; margin-bottom:8rpx; }
.hl-dot { color:#1DB954; font-size:20rpx; margin-top:4rpx; }
.hl-txt { font-size:25rpx; color:#444; flex:1; }

.spec-row { display:flex; align-items:center; background:#f8f8f8; border-radius:16rpx; padding:16rpx 0; }
.spec-item { flex:1; text-align:center; }
.spec-v { display:block; font-size:28rpx; font-weight:bold; color:#1a1a1a; margin-bottom:4rpx; }
.spec-l { font-size:21rpx; color:#aaa; }
.spec-div { width:1rpx; height:40rpx; background:#e0e0e0; }

.empty-result { text-align:center; padding:80rpx 40rpx; }
.empty-icon   { display:block; font-size:100rpx; margin-bottom:24rpx; }
.empty-text   { display:block; font-size:32rpx; font-weight:bold; color:#333; margin-bottom:12rpx; }
.empty-sub    { font-size:26rpx; color:#aaa; }

/* 详情弹窗 */
.modal-mask { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:999; display:flex; align-items:flex-end; }
.modal { background:#fff; border-radius:40rpx 40rpx 0 0; width:100%; max-height:88vh; display:flex; flex-direction:column; }
.modal-header { display:flex; justify-content:space-between; align-items:center; padding:32rpx 36rpx 20rpx; border-bottom:1rpx solid #f0f0f0; }
.modal-title  { font-size:34rpx; font-weight:bold; color:#1a1a1a; flex:1; }
.modal-close  { font-size:40rpx; color:#aaa; padding:0 10rpx; }
.modal-body   { flex:1; padding:0 36rpx 40rpx; overflow-y:auto; }
.detail-img   { width:100%; height:400rpx; margin:20rpx 0; }
.detail-price { display:block; font-size:44rpx; font-weight:bold; color:#e53935; margin-bottom:20rpx; }
.detail-desc  { display:block; font-size:28rpx; color:#444; line-height:1.7; margin-bottom:28rpx; }
.specs-table  { background:#f8f8f8; border-radius:20rpx; overflow:hidden; }
.spec-row2    { display:flex; padding:20rpx 24rpx; border-bottom:1rpx solid #efefef; }
.spec-row2:last-child { border:none; }
.sk { width:180rpx; font-size:26rpx; color:#888; }
.sv { flex:1; font-size:26rpx; color:#1a1a1a; font-weight:500; }
</style>

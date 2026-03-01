<template>
  <view class="create-page">
    <scroll-view scroll-y>
      <!-- 基本信息 -->
      <view class="card">
        <text class="card-title">📋 基本信息</text>

        <view class="form-item required">
          <text class="label">赛事名称</text>
          <input
            v-model="form.name"
            placeholder="例如：2026年春季羽毛球联赛"
            class="input"
            maxlength="30"
          />
        </view>

        <view class="form-item required">
          <text class="label">比赛场地</text>
          <input v-model="form.location" placeholder="输入场地名称或地址" class="input" />
        </view>

        <view class="form-item required">
          <text class="label">报名开始</text>
          <picker mode="date" :value="form.registerStart" @change="e => form.registerStart = e.detail.value">
            <view class="picker-val">{{ form.registerStart || '选择日期' }}</view>
          </picker>
        </view>

        <view class="form-item required">
          <text class="label">比赛日期</text>
          <picker mode="date" :value="form.startDate" @change="e => form.startDate = e.detail.value">
            <view class="picker-val">{{ form.startDate || '选择日期' }}</view>
          </picker>
        </view>

        <view class="form-item required">
          <text class="label">比赛时间</text>
          <picker mode="time" :value="form.startTime" @change="e => form.startTime = e.detail.value">
            <view class="picker-val">{{ form.startTime || '选择时间' }}</view>
          </picker>
        </view>
      </view>

      <!-- 赛制设置 -->
      <view class="card">
        <text class="card-title">⚙️ 赛制设置</text>

        <view class="form-item required">
          <text class="label">赛制类型</text>
          <view class="type-grid">
            <view
              v-for="t in matchTypes" :key="t.value"
              :class="['type-card', form.matchType === t.value && 'selected']"
              @click="form.matchType = t.value"
            >
              <text class="type-icon">{{ t.icon }}</text>
              <text class="type-name">{{ t.label }}</text>
              <text class="type-desc">{{ t.desc }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">最大人数</text>
          <view class="stepper-row">
            <text class="stepper-btn" @click="adjustMax(-1)">−</text>
            <text class="stepper-val">{{ form.maxPlayers }}</text>
            <text class="stepper-btn" @click="adjustMax(1)">＋</text>
          </view>
        </view>

        <view class="form-item">
          <text class="label">分组大小</text>
          <picker v-if="form.matchType === 'group'" :range="groupSizes" @change="e => form.groupSize = groupSizes[e.detail.value]">
            <view class="picker-val">{{ form.groupSize }} 人/组</view>
          </picker>
          <text v-else class="hint-text">仅分组赛有效</text>
        </view>

        <view class="form-item">
          <text class="label">参赛级别</text>
          <view class="tags-row">
            <view
              v-for="lv in allLevels" :key="lv"
              :class="['tag', form.levels.includes(lv) && 'active']"
              @click="toggleLevel(lv)"
            >{{ lv }}</view>
          </view>
        </view>
      </view>

      <!-- 报名设置 -->
      <view class="card">
        <text class="card-title">📝 报名设置</text>

        <view class="form-item">
          <text class="label">报名费用</text>
          <view class="input-suffix">
            <input v-model.number="form.fee" type="digit" placeholder="0" class="input" />
            <text class="suffix">元</text>
          </view>
        </view>

        <view class="form-item">
          <text class="label">需要审核</text>
          <switch :checked="form.needApprove" @change="e => form.needApprove = e.detail.value" color="#1DB954" />
        </view>

        <view class="form-item">
          <text class="label">允许团队报名</text>
          <switch :checked="form.allowTeam" @change="e => form.allowTeam = e.detail.value" color="#1DB954" />
        </view>

        <view class="form-item">
          <text class="label">赛事简介</text>
          <textarea
            v-model="form.description"
            placeholder="填写赛事规则、注意事项等（选填）"
            class="textarea"
            maxlength="200"
          />
          <text class="char-count">{{ form.description.length }}/200</text>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="card">
        <text class="card-title">📞 联系方式</text>
        <view class="form-item">
          <text class="label">联系人</text>
          <input v-model="form.contactName" placeholder="输入联系人姓名" class="input" />
        </view>
        <view class="form-item">
          <text class="label">联系电话</text>
          <input v-model="form.contactPhone" type="number" placeholder="输入手机号" class="input" />
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-btns">
        <button class="draft-btn btn-ghost" @click="handleSubmit('draft')" :loading="saving">存为草稿</button>
        <button class="publish-btn btn-primary" @click="handleSubmit('open')" :loading="saving">立即发布</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { createMatch } from '../../api/match'

const matchTypes = [
  { value: 'round_robin', icon: '🔄', label: '循环赛', desc: '所有人两两对决' },
  { value: 'knockout',    icon: '⚡', label: '淘汰赛', desc: '一轮决生死' },
  { value: 'group',       icon: '🏟️', label: '分组赛', desc: '先分组再淘汰' }
]
const allLevels = ['A组（高级）', 'B组（中级）', 'C组（初级）', '混合']
const groupSizes = [3, 4, 5, 6]

const saving = ref(false)
const form = ref({
  name: '',
  location: '',
  registerStart: '',
  startDate: '',
  startTime: '',
  matchType: 'round_robin',
  maxPlayers: 16,
  groupSize: 4,
  levels: ['B组（中级）'],
  fee: 0,
  needApprove: false,
  allowTeam: false,
  description: '',
  contactName: '',
  contactPhone: ''
})

const adjustMax = (delta) => {
  form.value.maxPlayers = Math.max(4, Math.min(64, form.value.maxPlayers + delta))
}

const toggleLevel = (lv) => {
  const idx = form.value.levels.indexOf(lv)
  if (idx === -1) form.value.levels.push(lv)
  else form.value.levels.splice(idx, 1)
}

const validate = () => {
  if (!form.value.name.trim())    return '请填写赛事名称'
  if (!form.value.location.trim())return '请填写比赛场地'
  if (!form.value.startDate)      return '请选择比赛日期'
  if (!form.value.startTime)      return '请选择比赛时间'
  if (form.value.levels.length === 0) return '请至少选择一个参赛级别'
  return null
}

const handleSubmit = async (status) => {
  const err = validate()
  if (err) return uni.showToast({ title: err, icon: 'none' })

  saving.value = true
  try {
    const payload = {
      ...form.value,
      status,
      startTime: `${form.value.startDate} ${form.value.startTime}`
    }
    await createMatch(payload)
    uni.showToast({ title: status === 'open' ? '发布成功！' : '已存为草稿', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.create-page { padding-bottom: 120rpx; }

.card {
  background: $bg-card; border-radius: $radius-md; padding: $space-md;
  margin: $space-sm; box-shadow: $shadow-card;
  .card-title { display: block; font-size: 32rpx; font-weight: bold; color: $text-primary; margin-bottom: $space-md; }
}

.form-item {
  display: flex; align-items: flex-start; padding: 22rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  &:last-child { border-bottom: none; }
  &.required .label::after { content: ' *'; color: $color-danger; }

  .label { width: 160rpx; font-size: 28rpx; color: $text-secondary; padding-top: 4rpx; flex-shrink: 0; }
  .input { flex: 1; font-size: 28rpx; color: $text-primary; }
  .picker-val { flex: 1; font-size: 28rpx; color: $text-primary; }
  .hint-text { flex: 1; font-size: 26rpx; color: $text-hint; }
  .textarea { flex: 1; font-size: 28rpx; color: $text-primary; min-height: 120rpx; }
  .char-count { font-size: 22rpx; color: $text-hint; margin-top: 8rpx; }
}

.type-grid {
  flex: 1; display: flex; gap: $space-xs;
  .type-card {
    flex: 1; border: 2rpx solid #eee; border-radius: $radius-md; padding: 20rpx 10rpx;
    text-align: center; transition: all 0.2s;
    &.selected { border-color: $brand-color; background: $brand-light; }
    .type-icon { display: block; font-size: 44rpx; margin-bottom: 8rpx; }
    .type-name { display: block; font-size: 26rpx; font-weight: bold; color: $text-primary; }
    .type-desc { display: block; font-size: 20rpx; color: $text-hint; margin-top: 4rpx; }
  }
}

.stepper-row {
  display: flex; align-items: center; gap: $space-sm;
  .stepper-btn {
    width: 56rpx; height: 56rpx; background: #f5f5f5; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 32rpx; color: $brand-color; font-weight: bold;
  }
  .stepper-val { font-size: 36rpx; font-weight: bold; min-width: 60rpx; text-align: center; }
}

.tags-row {
  flex: 1; display: flex; flex-wrap: wrap; gap: 12rpx;
  .tag {
    padding: 12rpx 24rpx; border-radius: $radius-full; font-size: 26rpx;
    border: 2rpx solid #eee; color: $text-secondary;
    &.active { border-color: $brand-color; background: $brand-light; color: $brand-color; font-weight: bold; }
  }
}

.input-suffix {
  flex: 1; display: flex; align-items: center;
  .input { flex: 1; }
  .suffix { font-size: 28rpx; color: $text-hint; margin-left: 8rpx; }
}

.bottom-btns {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; gap: $space-sm; padding: $space-sm;
  padding-bottom: calc(#{$space-sm} + env(safe-area-inset-bottom));
  background: #fff; box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.08);

  .draft-btn, .publish-btn { flex: 1; height: 90rpx; font-size: 32rpx; border-radius: $radius-full; }
  .draft-btn { background: transparent; color: $brand-color; border: 2rpx solid $brand-color; }
}
</style>

<!-- 登录后选择运动偏好弹窗 -->
<template>
  <view v-if="visible" class="sp-wrap">
    <view class="sp-mask"/>
    <view class="sp-sheet" :class="{ 'sp-show': visible }">
      <view class="sp-handle"/>
      <text class="sp-title">你主要打什么球？</text>
      <text class="sp-sub">选完之后直接进你的主场，随时可以在设置里调整</text>
      <view class="sp-cards">
        <view :class="['sp-card','sp-b', selected==='badminton'&&'sp-selected']" @tap="select('badminton')">
          <text class="sp-check" v-if="selected==='badminton'">✓</text>
          <text class="sp-emoji">🏸</text>
          <text class="sp-name">羽毛球</text>
        </view>
        <view :class="['sp-card','sp-t', selected==='tennis'&&'sp-selected']" @tap="select('tennis')">
          <text class="sp-check" v-if="selected==='tennis'">✓</text>
          <text class="sp-emoji">🎾</text>
          <text class="sp-name">网球</text>
        </view>
      </view>
      <view :class="['sp-both', selected==='both'&&'sp-both-selected']" @tap="select('both')">
        <text class="sp-check-both" v-if="selected==='both'">✓ </text>
        <text class="sp-both-txt">🏸🎾 两个都打（双栖选手）</text>
      </view>
      <button class="sp-confirm-btn" :disabled="!selected" @tap="confirm">确认</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SportPrefSheet',
  props: { visible: { type: Boolean, default: false } },
  emits: ['confirm'],
  data() { return { selected: '' } },
  methods: {
    select(v) { this.selected = v },
    confirm() {
      if (!this.selected) return
      uni.setStorageSync('sportPref', this.selected)
      this.$emit('confirm', this.selected)
    }
  }
}
</script>

<style lang="scss">
.sp-wrap  { position: fixed; inset: 0; z-index: 998; }
.sp-mask  { position: absolute; inset: 0; background: rgba(0,0,0,.5); }
.sp-sheet {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: #fff; border-radius: 32rpx 32rpx 0 0;
  padding: 24rpx 40rpx 60rpx;
  transform: translateY(100%);
  transition: transform .3s cubic-bezier(.4,0,.2,1);
}
.sp-show   { transform: translateY(0); }
.sp-handle { width: 60rpx; height: 8rpx; background: #e0e0e0; border-radius: 4rpx; margin: 0 auto 32rpx; }
.sp-title  { display: block; font-size: 40rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 8rpx; }
.sp-sub    { display: block; font-size: 24rpx; color: #aaa; margin-bottom: 40rpx; }

.sp-cards  { display: flex; gap: 20rpx; margin-bottom: 20rpx; }
.sp-card   {
  flex: 1; border-radius: 24rpx; padding: 36rpx 20rpx;
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
  position: relative; border: 3rpx solid transparent;
  transition: border-color .2s;
}
.sp-b { background: linear-gradient(145deg, #0faa4e, #1DB954); }
.sp-t { background: linear-gradient(145deg, #b5451b, #d4541f); }
.sp-selected { border-color: #fff; box-shadow: 0 0 0 4rpx rgba(255,255,255,.6); }
.sp-check {
  position: absolute; top: 14rpx; right: 18rpx;
  background: #fff; color: #1a1a1a; border-radius: 50%;
  width: 36rpx; height: 36rpx; font-size: 22rpx; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
}
.sp-emoji { font-size: 72rpx; }
.sp-name  { font-size: 32rpx; font-weight: bold; color: #fff; }

.sp-both {
  background: #f5f5f5; border-radius: 20rpx;
  padding: 28rpx; text-align: center;
  border: 3rpx solid transparent; margin-bottom: 32rpx;
  transition: all .2s;
}
.sp-both-selected { background: #f0f0f0; border-color: #1a1a2e; }
.sp-both-txt { font-size: 30rpx; color: #555; }
.sp-check-both { font-weight: bold; color: #1a1a2e; }

.sp-confirm-btn {
  width: 100%; height: 96rpx; background: #1a1a2e;
  color: #fff; border-radius: 50rpx; font-size: 32rpx;
}
.sp-confirm-btn[disabled] { opacity: .35; }
</style>

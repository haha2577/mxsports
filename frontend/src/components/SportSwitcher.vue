<!--
  SportSwitcher - 统一运动切换组件
  Props:
    active   - 当前运动 'badminton' | 'tennis'
    sportPref - 偏好 'badminton' | 'tennis' | 'both'（父页面传入，响应式）
  Emit:
    switch(sport)
-->
<template>
  <view v-if="sportPref === 'both'" class="sport-switcher">
    <view :class="['ss-tab', active==='badminton' && 'ss-active']" @tap="$emit('switch','badminton')">
      <text class="ss-emoji">🏸</text>
      <text class="ss-label">羽毛球</text>
    </view>
    <view :class="['ss-tab', active==='tennis' && 'ss-active']" @tap="$emit('switch','tennis')">
      <text class="ss-emoji">🎾</text>
      <text class="ss-label">网球</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SportSwitcher',
  props: {
    active:    { type: String, default: 'badminton' },
    sportPref: { type: String, default: '' },
  },
  emits: ['switch'],
}
</script>

<style lang="scss">
.sport-switcher {
  display: inline-flex;
  background: rgba(255,255,255,.15);
  border: 1rpx solid rgba(255,255,255,.2);
  border-radius: 50rpx;
  padding: 4rpx;
  gap: 4rpx;
}
.ss-tab {
  display: flex; align-items: center; gap: 8rpx;
  padding: 10rpx 22rpx; border-radius: 50rpx;
  transition: background .2s;
}
.ss-active { background: rgba(255,255,255,.9); }
.ss-active .ss-label { color: #1a1a2e; font-weight: bold; }
.ss-emoji { font-size: 26rpx; }
.ss-label { font-size: 22rpx; color: rgba(255,255,255,.9); }
</style>

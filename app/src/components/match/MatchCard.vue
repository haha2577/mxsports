<template>
  <view class="match-card" @click="$emit('click')">
    <view class="card-left">
      <text class="match-name">{{ match.name }}</text>
      <text class="match-meta">📅 {{ formatDate(match.startTime) }}</text>
      <text class="match-meta">📍 {{ match.location }}</text>
    </view>
    <view class="card-right">
      <view :class="['status-dot', match.status]" />
      <text class="player-count">{{ match.registeredCount }}人</text>
      <text class="match-type">{{ typeText }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '../../utils/util'

const props = defineProps({ match: Object })
defineEmits(['click'])

const typeText = computed(() => ({
  round_robin: '循环赛', knockout: '淘汰赛', group: '分组赛'
}[props.match?.matchType] || ''))
</script>

<style lang="scss" scoped>
.match-card {
  background: #fff; border-radius: 20rpx; padding: 30rpx;
  margin-bottom: 20rpx; display: flex; align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);

  .card-left { flex: 1;
    .match-name { display: block; font-size: 32rpx; font-weight: bold; color: #222; margin-bottom: 12rpx; }
    .match-meta { display: block; font-size: 24rpx; color: #888; margin-bottom: 6rpx; }
  }
  .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10rpx;
    .status-dot { width: 16rpx; height: 16rpx; border-radius: 50%;
      &.open { background: #1DB954; }
      &.ongoing { background: #ff8c00; }
      &.finished { background: #ccc; } }
    .player-count { font-size: 24rpx; color: #666; }
    .match-type { font-size: 22rpx; color: #1DB954; background: #e8f7ee; padding: 4rpx 16rpx; border-radius: 20rpx; }
  }
}
</style>

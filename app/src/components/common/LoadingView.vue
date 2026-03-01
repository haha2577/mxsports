<template>
  <view class="loading-view" :style="{ minHeight: minH }">
    <view v-if="status === 'loading'" class="loading-inner">
      <view class="spinner" />
      <text class="loading-text">{{ loadingText }}</text>
    </view>
    <view v-else-if="status === 'error'" class="error-inner" @click="$emit('retry')">
      <text class="error-icon">😵</text>
      <text class="error-msg">{{ errorText }}</text>
      <view class="retry-btn">点击重试</view>
    </view>
    <view v-else-if="status === 'empty'" class="empty-inner">
      <text class="empty-icon">{{ emptyIcon }}</text>
      <text class="empty-msg">{{ emptyText }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  status:      { type: String, default: 'loading' }, // loading | error | empty
  loadingText: { type: String, default: '加载中...' },
  errorText:   { type: String, default: '加载失败，请重试' },
  emptyText:   { type: String, default: '暂无数据' },
  emptyIcon:   { type: String, default: '🏸' },
  minH:        { type: String, default: '300rpx' }
})
defineEmits(['retry'])
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.loading-view {
  display: flex; align-items: center; justify-content: center;

  .loading-inner, .error-inner, .empty-inner {
    display: flex; flex-direction: column; align-items: center; gap: 20rpx;
  }

  .spinner {
    width: 60rpx; height: 60rpx;
    border: 6rpx solid #eee;
    border-top-color: $brand-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-text { font-size: 26rpx; color: $text-hint; }

  .error-icon, .empty-icon { font-size: 80rpx; }
  .error-msg, .empty-msg { font-size: 28rpx; color: $text-hint; }
  .retry-btn {
    margin-top: 10rpx; padding: 16rpx 40rpx; border-radius: $radius-full;
    background: $brand-light; color: $brand-color; font-size: 28rpx;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

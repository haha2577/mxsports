<script>
import { useUserStore } from './store/modules/user'

export default {
  onLaunch() {
    const userStore = useUserStore()
    userStore.initUser()
    // 检查是否需要引导登录
    if (!userStore.isLogin) {
      uni.reLaunch({ url: '/pages/auth/login' })
    }
  },
  onShow() {},
  onHide() {}
}
</script>

<style lang="scss">
@import './uni.scss';

page {
  background-color: $bg-page;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 28rpx;
  color: $text-primary;
}

/* ===== 全局通用类 ===== */
.container { padding: $space-sm; }

.card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $space-md;
  margin-bottom: $space-sm;
  box-shadow: $shadow-card;
}

.btn-primary {
  background: linear-gradient(135deg, $brand-color, $brand-dark);
  color: #fff !important;
  border-radius: $radius-full;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  &[disabled] { opacity: 0.5; }
}

.btn-ghost {
  background: transparent;
  color: $brand-color;
  border: 2rpx solid $brand-color;
  border-radius: $radius-full;
  font-size: 32rpx;
}

.status-tag {
  display: inline-block;
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: $radius-full;
  &.open    { background: $brand-light; color: $brand-color; }
  &.ongoing { background: #fff3e0;      color: $color-ongoing; }
  &.finished{ background: #f5f5f5;      color: $text-hint; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  color: $text-hint;
  .empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
  text { font-size: 28rpx; }
}
</style>

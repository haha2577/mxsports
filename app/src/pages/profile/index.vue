<template>
  <view class="profile-page">
    <view class="profile-header">
      <image :src="userStore.avatar" class="avatar" mode="aspectFill" />
      <view class="user-info">
        <text class="nickname">{{ userStore.nickname }}</text>
        <text class="openid" v-if="userStore.userInfo?.openid">ID: {{ userStore.userInfo.openid.slice(0,8) }}...</text>
      </view>
    </view>

    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-num">{{ stats.totalMatches }}</text>
        <text class="stat-label">参赛场次</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.wins }}</text>
        <text class="stat-label">胜场</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.winRate }}%</text>
        <text class="stat-label">胜率</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" v-for="item in menus" :key="item.label" @click="item.action()">
        <text class="menu-icon">{{ item.icon }}</text>
        <text class="menu-label">{{ item.label }}</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <button class="logout-btn" @click="handleLogout">退出登录</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../store/modules/user'

const userStore = useUserStore()
const stats = ref({ totalMatches: 0, wins: 0, winRate: 0 })

const menus = [
  { icon: '📋', label: '我的报名', action: () => uni.navigateTo({ url: '/pages/register/index' }) },
  { icon: '🏆', label: '比赛记录', action: () => uni.navigateTo({ url: '/pages/match/index' }) },
  { icon: '⚙️', label: '个人设置', action: () => uni.showToast({ title: '开发中', icon: 'none' }) },
  { icon: '📞', label: '联系客服', action: () => uni.makePhoneCall({ phoneNumber: '400-000-0000' }) },
  { icon: 'ℹ️', label: '关于我们', action: () => uni.showToast({ title: '羽毛球赛事 v1.0.0', icon: 'none' }) }
]

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => { if (res.confirm) userStore.logout() }
  })
}
</script>

<style lang="scss" scoped>
.profile-page { padding-bottom: 40rpx; }

.profile-header {
  background: linear-gradient(135deg, #1DB954, #17a045);
  padding: 60rpx 40rpx 40rpx;
  display: flex; align-items: center;
  .avatar { width: 120rpx; height: 120rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.8); }
  .user-info { margin-left: 30rpx;
    .nickname { display: block; font-size: 40rpx; font-weight: bold; color: #fff; margin-bottom: 10rpx; }
    .openid { font-size: 24rpx; color: rgba(255,255,255,0.7); }
  }
}

.stats-row {
  display: flex; background: #fff; margin: 20rpx; border-radius: 20rpx;
  padding: 30rpx 0; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
  .stat-item { flex: 1; text-align: center;
    .stat-num { display: block; font-size: 44rpx; font-weight: bold; color: #1DB954; }
    .stat-label { font-size: 24rpx; color: #999; }
  }
}

.menu-list {
  background: #fff; border-radius: 20rpx; margin: 0 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); overflow: hidden;
  .menu-item {
    display: flex; align-items: center; padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    .menu-icon { font-size: 36rpx; margin-right: 20rpx; }
    .menu-label { flex: 1; font-size: 30rpx; color: #333; }
    .menu-arrow { color: #ccc; font-size: 32rpx; }
  }
}

.logout-btn {
  margin: 40rpx 20rpx 0; height: 90rpx; font-size: 32rpx;
  background: #fff; color: #ff4444; border-radius: 50rpx;
  border: 2rpx solid #ffcccc;
}
</style>

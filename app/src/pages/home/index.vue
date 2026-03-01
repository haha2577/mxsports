<template>
  <view class="home-page">
    <!-- Banner -->
    <view class="banner">
      <view class="banner-content">
        <text class="banner-title">🏸 欢迎回来</text>
        <text class="banner-name">{{ userStore.nickname }}</text>
        <text class="banner-sub">找到你的下一场比赛</text>
      </view>
      <image :src="userStore.avatar" class="banner-avatar" mode="aspectFill" />
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-item" @click="goTo('/pages/register/index')">
        <view class="action-icon-wrap green"><text class="action-icon">📋</text></view>
        <text class="action-text">赛事报名</text>
      </view>
      <view class="action-item" @click="goTo('/pages/match/index')">
        <view class="action-icon-wrap blue"><text class="action-icon">⚔️</text></view>
        <text class="action-text">比赛对阵</text>
      </view>
      <view class="action-item" @click="goTo('/pages/match/create')">
        <view class="action-icon-wrap orange"><text class="action-icon">➕</text></view>
        <text class="action-text">创建赛事</text>
      </view>
      <view class="action-item" @click="goTo('/pages/profile/index')">
        <view class="action-icon-wrap purple"><text class="action-icon">👤</text></view>
        <text class="action-text">个人中心</text>
      </view>
    </view>

    <!-- 我的报名（若有） -->
    <view class="section" v-if="myMatches.length">
      <view class="section-header">
        <text class="section-title">📌 我的报名</text>
      </view>
      <scroll-view scroll-x class="my-matches-scroll">
        <view v-for="m in myMatches" :key="m.id" class="my-match-card" @click="goToDetail(m.id)">
          <text class="my-match-name">{{ m.name }}</text>
          <view :class="['status-tag', m.status]">{{ statusText(m.status) }}</view>
          <text class="my-match-time">{{ formatDate(m.startTime) }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 最新赛事 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">🔥 最新赛事</text>
        <text class="section-more" @click="goTo('/pages/register/index')">查看全部 ›</text>
      </view>

      <uni-load-more v-if="matchStore.loading" status="loading" />

      <view v-else-if="matchStore.matchList.length === 0" class="empty-state">
        <text class="empty-icon">🏸</text>
        <text>暂无赛事，敬请期待</text>
      </view>

      <template v-else>
        <match-card
          v-for="match in matchStore.matchList"
          :key="match.id"
          :match="match"
          @click="goToDetail(match.id)"
        />
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/modules/user'
import { useMatchStore } from '../../store/modules/match'
import { getMyRegistrations } from '../../api/register'
import { formatDate } from '../../utils/util'
import MatchCard from '../../components/match/MatchCard.vue'

const userStore = useUserStore()
const matchStore = useMatchStore()
const myMatches = ref([])

const statusText = (s) => ({ open:'报名中', ongoing:'进行中', finished:'已结束' }[s] || s)
const goTo = (url) => uni.navigateTo({ url })
const goToDetail = (id) => uni.navigateTo({ url: `/pages/match/detail?id=${id}` })

onMounted(async () => {
  matchStore.fetchMatchList()
  try {
    const res = await getMyRegistrations()
    myMatches.value = (res.data || []).slice(0, 5)
  } catch(e) {}
})
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.home-page { padding-bottom: 30rpx; }

.banner {
  background: linear-gradient(135deg, $brand-color, $brand-dark);
  padding: 60rpx 40rpx 40rpx;
  display: flex; justify-content: space-between; align-items: flex-end;
  .banner-content {
    .banner-title { display: block; font-size: 32rpx; color: rgba(255,255,255,0.85); }
    .banner-name  { display: block; font-size: 52rpx; font-weight: bold; color: #fff; margin: 8rpx 0; }
    .banner-sub   { font-size: 26rpx; color: rgba(255,255,255,0.75); }
  }
  .banner-avatar { width: 100rpx; height: 100rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.8); }
}

.quick-actions {
  display: flex; background: $bg-card; margin: $space-sm; border-radius: $radius-md;
  padding: $space-md 0; box-shadow: $shadow-card;

  .action-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12rpx;
    .action-icon-wrap {
      width: 88rpx; height: 88rpx; border-radius: $radius-md;
      display: flex; align-items: center; justify-content: center;
      .action-icon { font-size: 44rpx; }
      &.green  { background: #e8f7ee; }
      &.blue   { background: #e3f2fd; }
      &.orange { background: #fff3e0; }
      &.purple { background: #f3e5f5; }
    }
    .action-text { font-size: 24rpx; color: $text-secondary; }
  }
}

.section {
  padding: 0 $space-sm;
  margin-bottom: $space-sm;
  &-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: $space-sm; }
  .section-title { font-size: 34rpx; font-weight: bold; color: $text-primary; }
  .section-more  { font-size: 26rpx; color: $brand-color; }
}

.my-matches-scroll { white-space: nowrap; }
.my-match-card {
  display: inline-flex; flex-direction: column; width: 300rpx; margin-right: $space-sm;
  background: $bg-card; border-radius: $radius-md; padding: $space-md;
  box-shadow: $shadow-card; white-space: normal; vertical-align: top;
  .my-match-name { font-size: 28rpx; font-weight: bold; color: $text-primary; margin-bottom: 10rpx;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .my-match-time { font-size: 22rpx; color: $text-hint; margin-top: 10rpx; }
}
</style>

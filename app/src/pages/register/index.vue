<template>
  <view class="register-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="item in filters"
        :key="item.value"
        :class="['filter-item', activeFilter === item.value && 'active']"
        @click="setFilter(item.value)"
      >
        {{ item.label }}
      </view>
    </view>

    <!-- 赛事卡片列表 -->
    <scroll-view scroll-y class="match-list" @scrolltolower="loadMore">
      <view v-if="loading && list.length === 0" class="loading-wrap">
        <uni-load-more status="loading" />
      </view>

      <view v-else-if="list.length === 0" class="empty">
        <text class="empty-icon">🏸</text>
        <text>暂无赛事</text>
      </view>

      <view v-else>
        <view
          v-for="match in list"
          :key="match.id"
          class="match-item"
          @click="openDetail(match)"
        >
          <view class="match-header">
            <text class="match-name">{{ match.name }}</text>
            <view :class="['status-tag', match.status]">{{ statusMap[match.status] }}</view>
          </view>
          <view class="match-info">
            <text>📅 {{ formatDate(match.startTime) }}</text>
            <text>📍 {{ match.location }}</text>
            <text>👥 已报名 {{ match.registeredCount }}/{{ match.maxPlayers }} 人</text>
          </view>
          <view class="match-footer">
            <text class="match-type">{{ typeMap[match.matchType] }}</text>
            <button
              v-if="match.status === 'open'"
              class="register-btn"
              :disabled="match.registeredCount >= match.maxPlayers"
              @click.stop="handleRegister(match)"
            >
              {{ match.registeredCount >= match.maxPlayers ? '报名已满' : '立即报名' }}
            </button>
          </view>
        </view>
      </view>

      <uni-load-more v-if="list.length > 0" :status="loadMoreStatus" />
    </scroll-view>

    <!-- 报名弹窗 -->
    <uni-popup ref="popupRef" type="bottom">
      <view class="register-popup" v-if="selectedMatch">
        <text class="popup-title">报名确认</text>
        <text class="popup-match">{{ selectedMatch.name }}</text>
        <view class="form-item">
          <text class="label">参赛级别</text>
          <picker :range="levels" @change="onLevelChange">
            <view class="picker-val">{{ form.level || '请选择' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">备注</text>
          <input v-model="form.remark" placeholder="选填" class="input" />
        </view>
        <button class="confirm-btn btn-primary" @click="submitRegister" :loading="submitting">
          确认报名
        </button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMatchList } from '../../api/match'
import { registerMatch } from '../../api/register'
import { formatDate } from '../../utils/util'

const filters = [
  { label: '全部', value: '' },
  { label: '报名中', value: 'open' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'finished' }
]
const statusMap = { open: '报名中', ongoing: '进行中', finished: '已结束', draft: '草稿' }
const typeMap = { round_robin: '循环赛', knockout: '淘汰赛', group: '分组赛' }
const levels = ['A组（高级）', 'B组（中级）', 'C组（初级）', '随机分配']

const activeFilter = ref('')
const list = ref([])
const loading = ref(false)
const loadMoreStatus = ref('more')
const page = ref(1)
const popupRef = ref(null)
const selectedMatch = ref(null)
const submitting = ref(false)
const form = ref({ level: '', remark: '' })

const fetchList = async (reset = false) => {
  if (reset) { page.value = 1; list.value = [] }
  loading.value = true
  try {
    const res = await getMatchList({ status: activeFilter.value, page: page.value, size: 10 })
    list.value = reset ? res.data.list : [...list.value, ...res.data.list]
    loadMoreStatus.value = res.data.hasMore ? 'more' : 'noMore'
  } catch(e) {
    loadMoreStatus.value = 'more'
  } finally {
    loading.value = false
  }
}

const setFilter = (val) => { activeFilter.value = val; fetchList(true) }
const loadMore = () => { if (loadMoreStatus.value === 'more') { page.value++; fetchList() } }

const openDetail = (match) => {
  selectedMatch.value = match
  form.value = { level: '', remark: '' }
  popupRef.value?.open()
}

const onLevelChange = (e) => { form.value.level = levels[e.detail.value] }

const handleRegister = (match) => {
  selectedMatch.value = match
  form.value = { level: '', remark: '' }
  popupRef.value?.open()
}

const submitRegister = async () => {
  if (!form.value.level) return uni.showToast({ title: '请选择参赛级别', icon: 'none' })
  submitting.value = true
  try {
    await registerMatch(selectedMatch.value.id, form.value)
    uni.showToast({ title: '报名成功！', icon: 'success' })
    popupRef.value?.close()
    fetchList(true)
  } finally {
    submitting.value = false
  }
}

onMounted(() => fetchList(true))
</script>

<style lang="scss" scoped>
.register-page { display: flex; flex-direction: column; height: 100vh; }

.filter-bar {
  display: flex;
  background: #fff;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
  .filter-item {
    flex: 1; text-align: center; padding: 12rpx 0; font-size: 28rpx;
    color: #666; border-radius: 30rpx;
    &.active { background: #1DB954; color: #fff; font-weight: bold; }
  }
}

.match-list { flex: 1; padding: 20rpx; }

.match-item {
  background: #fff; border-radius: 20rpx; padding: 30rpx;
  margin-bottom: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);

  .match-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx;
    .match-name { font-size: 34rpx; font-weight: bold; color: #222; }
    .status-tag {
      font-size: 22rpx; padding: 6rpx 18rpx; border-radius: 20rpx;
      &.open { background: #e8f7ee; color: #1DB954; }
      &.ongoing { background: #fff3e0; color: #ff8c00; }
      &.finished { background: #f5f5f5; color: #999; }
    }
  }

  .match-info {
    display: flex; flex-direction: column; gap: 10rpx;
    font-size: 26rpx; color: #666; margin-bottom: 20rpx;
  }

  .match-footer {
    display: flex; justify-content: space-between; align-items: center;
    .match-type { font-size: 24rpx; color: #999; }
    .register-btn {
      background: #1DB954; color: #fff; border-radius: 30rpx;
      font-size: 26rpx; padding: 10rpx 36rpx; border: none;
      &[disabled] { background: #ccc; }
    }
  }
}

.register-popup {
  background: #fff; border-radius: 30rpx 30rpx 0 0;
  padding: 40rpx; padding-bottom: calc(40rpx + env(safe-area-inset-bottom));

  .popup-title { display: block; font-size: 36rpx; font-weight: bold; margin-bottom: 10rpx; }
  .popup-match { display: block; font-size: 28rpx; color: #666; margin-bottom: 30rpx; }

  .form-item {
    display: flex; align-items: center; padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    .label { width: 160rpx; font-size: 30rpx; color: #333; }
    .picker-val, .input { flex: 1; font-size: 30rpx; color: #333; }
  }

  .confirm-btn { margin-top: 40rpx; height: 90rpx; font-size: 34rpx; }
}

.empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 100rpx 0; color: #999;
  .empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
}
</style>

<template>
  <view class="match-page">
    <view class="tabs">
      <view
        v-for="tab in tabs" :key="tab.value"
        :class="['tab', activeTab === tab.value && 'active']"
        @click="activeTab = tab.value"
      >{{ tab.label }}</view>
    </view>

    <!-- 生成对阵 -->
    <view v-if="activeTab === 'generate'" class="generate-section">
      <view class="card">
        <text class="card-title">⚙️ 赛制设置</text>
        <view class="form-row">
          <text class="label">赛制类型</text>
          <picker :range="matchTypes" range-key="label" @change="onTypeChange">
            <view class="picker-val">{{ selectedType.label }} ›</view>
          </picker>
        </view>
        <view class="form-row">
          <text class="label">赛事名称</text>
          <input v-model="form.name" placeholder="输入赛事名称" class="input" />
        </view>
        <view class="form-row">
          <text class="label">场地</text>
          <input v-model="form.location" placeholder="输入场地地址" class="input" />
        </view>
        <view class="form-row">
          <text class="label">比赛时间</text>
          <picker mode="date" @change="onDateChange">
            <view class="picker-val">{{ form.date || '选择日期' }} ›</view>
          </picker>
        </view>
      </view>

      <view class="card">
        <view class="card-title-row">
          <text class="card-title">👥 参赛名单（{{ players.length }} 人）</text>
          <text class="add-btn" @click="showAddPlayer = true">+ 添加</text>
        </view>
        <view v-if="players.length === 0" class="empty-players">
          <text>还没有添加参赛者</text>
        </view>
        <view v-else class="player-list">
          <view v-for="(p, i) in players" :key="i" class="player-tag">
            <text>{{ p.name }}</text>
            <text class="remove" @click="removePlayer(i)">×</text>
          </view>
        </view>
      </view>

      <button class="generate-btn btn-primary" @click="handleGenerate" :loading="generating">
        🏸 生成对阵表
      </button>
    </view>

    <!-- 对阵展示 -->
    <view v-if="activeTab === 'bracket' && bracket">
      <view class="card" v-if="selectedType.value === 'round_robin'">
        <text class="card-title">循环赛对阵</text>
        <view v-for="(m, i) in bracket" :key="i" class="game-row">
          <text class="game-num">第{{ i+1 }}场</text>
          <text class="player">{{ m.player1.name }}</text>
          <text class="vs">VS</text>
          <text class="player">{{ m.player2.name }}</text>
          <view :class="['game-status', m.status]">{{ m.status === 'pending' ? '待赛' : '已完' }}</view>
        </view>
      </view>

      <view v-if="selectedType.value === 'knockout'">
        <view v-for="(round, ri) in bracket" :key="ri" class="card">
          <text class="card-title">第{{ ri+1 }}轮</text>
          <view v-for="(m, mi) in round" :key="mi" class="game-row">
            <text class="player">{{ m.player1.name }}</text>
            <text class="vs">VS</text>
            <text class="player">{{ m.player2.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 我的比赛 -->
    <view v-if="activeTab === 'mine'">
      <view class="card" v-for="m in myMatches" :key="m.id" @click="goDetail(m.id)">
        <text class="match-name">{{ m.name }}</text>
        <text class="match-info">{{ formatDate(m.startTime) }} · {{ m.location }}</text>
        <view :class="['status-tag', m.status]">{{ statusText(m.status) }}</view>
      </view>
      <view v-if="myMatches.length === 0" class="empty">暂无比赛记录</view>
    </view>

    <!-- 添加选手弹窗 -->
    <uni-popup ref="addPopupRef" type="dialog">
      <view class="add-player-dialog">
        <text class="dialog-title">添加参赛者</text>
        <input v-model="newPlayerName" placeholder="输入姓名" class="dialog-input" />
        <view class="dialog-btns">
          <button @click="addPopupRef?.close()">取消</button>
          <button class="btn-primary" @click="confirmAddPlayer">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { generateRoundRobin, generateKnockout, formatDate } from '../../utils/util'
import { createMatch } from '../../api/match'
import { getMyRegistrations } from '../../api/register'

const tabs = [
  { label: '生成比赛', value: 'generate' },
  { label: '对阵表', value: 'bracket' },
  { label: '我的比赛', value: 'mine' }
]
const matchTypes = [
  { label: '循环赛（Round Robin）', value: 'round_robin' },
  { label: '单淘汰赛（Knockout）', value: 'knockout' },
  { label: '分组循环赛', value: 'group' }
]

const activeTab = ref('generate')
const selectedType = ref(matchTypes[0])
const form = ref({ name: '', location: '', date: '' })
const players = ref([])
const bracket = ref(null)
const generating = ref(false)
const showAddPlayer = ref(false)
const addPopupRef = ref(null)
const newPlayerName = ref('')
const myMatches = ref([])

const onTypeChange = (e) => { selectedType.value = matchTypes[e.detail.value] }
const onDateChange = (e) => { form.value.date = e.detail.value }

const removePlayer = (i) => players.value.splice(i, 1)

const confirmAddPlayer = () => {
  if (!newPlayerName.value.trim()) return
  players.value.push({ id: Date.now(), name: newPlayerName.value.trim() })
  newPlayerName.value = ''
  addPopupRef.value?.close()
}

watch(showAddPlayer, (val) => { if (val) addPopupRef.value?.open() })

const handleGenerate = async () => {
  if (!form.value.name) return uni.showToast({ title: '请输入赛事名称', icon: 'none' })
  if (players.value.length < 2) return uni.showToast({ title: '至少需要2名参赛者', icon: 'none' })

  generating.value = true
  try {
    if (selectedType.value.value === 'round_robin') {
      bracket.value = generateRoundRobin(players.value)
    } else if (selectedType.value.value === 'knockout') {
      bracket.value = generateKnockout(players.value)
    }
    // 同步到服务器
    await createMatch({
      ...form.value,
      matchType: selectedType.value.value,
      players: players.value
    })
    uni.showToast({ title: '对阵生成成功！', icon: 'success' })
    activeTab.value = 'bracket'
  } catch(e) {
    console.error(e)
  } finally {
    generating.value = false
  }
}

const goDetail = (id) => uni.navigateTo({ url: `/pages/match/detail?id=${id}` })
const statusText = (s) => ({ open:'报名中', ongoing:'进行中', finished:'已结束' }[s] || s)

onMounted(async () => {
  try {
    const res = await getMyRegistrations()
    myMatches.value = res.data || []
  } catch(e) {}
})
</script>

<style lang="scss" scoped>
.match-page { padding-bottom: 40rpx; }

.tabs {
  display: flex; background: #fff; border-bottom: 2rpx solid #eee;
  .tab {
    flex: 1; text-align: center; padding: 28rpx 0;
    font-size: 28rpx; color: #666;
    &.active { color: #1DB954; border-bottom: 4rpx solid #1DB954; font-weight: bold; }
  }
}

.card {
  background: #fff; border-radius: 20rpx; padding: 30rpx;
  margin: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
  .card-title { font-size: 32rpx; font-weight: bold; color: #222; display: block; margin-bottom: 24rpx; }
  .card-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx;
    .add-btn { color: #1DB954; font-size: 28rpx; } }
}

.form-row {
  display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5;
  .label { width: 160rpx; font-size: 28rpx; color: #333; }
  .picker-val, .input { flex: 1; font-size: 28rpx; color: #333; }
}

.player-list { display: flex; flex-wrap: wrap; gap: 16rpx;
  .player-tag {
    background: #e8f7ee; color: #1DB954; padding: 12rpx 24rpx;
    border-radius: 30rpx; font-size: 26rpx; display: flex; align-items: center; gap: 10rpx;
    .remove { color: #999; font-size: 32rpx; }
  }
}

.generate-btn {
  margin: 20rpx; height: 96rpx; font-size: 34rpx;
  background: linear-gradient(135deg, #1DB954, #17a045);
  color: #fff; border-radius: 50rpx; border: none;
}

.game-row {
  display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5;
  .game-num { width: 80rpx; font-size: 24rpx; color: #999; }
  .player { flex: 1; text-align: center; font-size: 28rpx; }
  .vs { padding: 0 16rpx; color: #ff4444; font-weight: bold; font-size: 26rpx; }
  .game-status { font-size: 22rpx; padding: 6rpx 16rpx; border-radius: 20rpx;
    &.pending { background: #fff3e0; color: #ff8c00; }
    &.done { background: #e8f7ee; color: #1DB954; } }
}

.add-player-dialog {
  background: #fff; padding: 40rpx; border-radius: 20rpx; min-width: 500rpx;
  .dialog-title { font-size: 34rpx; font-weight: bold; display: block; margin-bottom: 30rpx; }
  .dialog-input { border: 1rpx solid #eee; border-radius: 12rpx; padding: 20rpx; font-size: 28rpx; width: 100%; }
  .dialog-btns { display: flex; gap: 20rpx; margin-top: 30rpx;
    button { flex: 1; height: 80rpx; font-size: 28rpx; } }
}

.empty, .empty-players { text-align: center; padding: 40rpx; color: #999; font-size: 26rpx; }
</style>

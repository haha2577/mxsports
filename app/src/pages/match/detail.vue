<template>
  <view class="detail-page" v-if="match">
    <!-- Hero 头部 -->
    <view class="hero">
      <text class="match-name">{{ match.name }}</text>
      <view :class="['status-tag', match.status]">{{ statusText(match.status) }}</view>
      <view class="meta">
        <view class="meta-item"><text class="meta-icon">📅</text><text>{{ formatDate(match.startTime) }}</text></view>
        <view class="meta-item"><text class="meta-icon">📍</text><text>{{ match.location }}</text></view>
        <view class="meta-item"><text class="meta-icon">👥</text><text>{{ match.registeredCount }} 人参赛</text></view>
        <view class="meta-item"><text class="meta-icon">🏆</text><text>{{ typeText(match.matchType) }}</text></view>
      </view>
    </view>

    <!-- 对阵 + 记分 -->
    <view class="card section" v-if="match.games && match.games.length">
      <view class="section-header">
        <text class="section-title">⚔️ 对阵表</text>
        <text class="edit-hint" v-if="isOrganizer">点击比分可编辑</text>
      </view>

      <view v-for="(game, i) in match.games" :key="game.id" class="game-row">
        <text class="round-num">{{ i + 1 }}</text>
        <view class="players-col">
          <text :class="['pname', game.winnerId === game.player1?.id && 'winner']">
            {{ game.player1?.name || '待定' }}
          </text>
        </view>

        <!-- 比分区域 -->
        <view class="score-block" @click="isOrganizer && openScoreEdit(game, i)">
          <view class="score-box" :class="{ editable: isOrganizer }">
            <text class="score-num">{{ game.score1 ?? '-' }}</text>
            <text class="score-sep">:</text>
            <text class="score-num">{{ game.score2 ?? '-' }}</text>
          </view>
          <text class="edit-icon" v-if="isOrganizer">✏️</text>
        </view>

        <view class="players-col right">
          <text :class="['pname', game.winnerId === game.player2?.id && 'winner']">
            {{ game.player2?.name || '待定' }}
          </text>
        </view>

        <view :class="['game-badge', game.status]">
          {{ { pending:'待赛', ongoing:'进行中', finished:'已完' }[game.status] }}
        </view>
      </view>
    </view>

    <!-- 积分榜（循环赛） -->
    <view class="card section" v-if="match.matchType === 'round_robin' && standings.length">
      <text class="section-title">📊 积分榜</text>
      <view class="standings-header">
        <text class="rank-col">#</text>
        <text class="name-col">选手</text>
        <text class="stat-col">胜</text>
        <text class="stat-col">负</text>
        <text class="stat-col">积分</text>
      </view>
      <view v-for="(s, i) in standings" :key="s.playerId" :class="['standing-row', i < 2 && 'top']">
        <text class="rank-col">{{ i + 1 }}</text>
        <text class="name-col">{{ s.name }}</text>
        <text class="stat-col win">{{ s.wins }}</text>
        <text class="stat-col">{{ s.losses }}</text>
        <text class="stat-col points">{{ s.points }}</text>
      </view>
    </view>

    <!-- 参赛名单 -->
    <view class="card section">
      <text class="section-title">👥 参赛名单</text>
      <view class="player-row" v-for="p in match.players" :key="p.id">
        <image :src="p.avatar || '/static/images/default-avatar.png'" class="avatar" mode="aspectFill" />
        <view class="player-info">
          <text class="pname">{{ p.name }}</text>
          <text class="plevel">{{ p.level }}</text>
        </view>
        <view class="player-wins" v-if="match.matchType === 'round_robin'">
          <text>{{ getPlayerWins(p.id) }}胜</text>
        </view>
      </view>
    </view>
  </view>

  <!-- 加载中 -->
  <view v-else class="loading-page">
    <uni-load-more status="loading" />
    <text class="loading-text">加载中...</text>
  </view>

  <!-- 记分弹窗 -->
  <uni-popup ref="scorePopupRef" type="bottom" background-color="#fff">
    <view class="score-popup" v-if="editingGame">
      <view class="popup-header">
        <text class="popup-title">📝 录入比分</text>
        <text class="popup-close" @click="scorePopupRef?.close()">✕</text>
      </view>
      <text class="popup-match-name">
        {{ editingGame.player1?.name }} VS {{ editingGame.player2?.name }}
      </text>

      <view class="score-input-row">
        <view class="score-side">
          <text class="score-player">{{ editingGame.player1?.name }}</text>
          <view class="score-stepper">
            <text class="stepper-btn" @click="adjustScore('score1', -1)">−</text>
            <text class="score-val">{{ scoreForm.score1 }}</text>
            <text class="stepper-btn" @click="adjustScore('score1', 1)">＋</text>
          </view>
        </view>
        <text class="vs-label">VS</text>
        <view class="score-side">
          <text class="score-player">{{ editingGame.player2?.name }}</text>
          <view class="score-stepper">
            <text class="stepper-btn" @click="adjustScore('score2', -1)">−</text>
            <text class="score-val">{{ scoreForm.score2 }}</text>
            <text class="stepper-btn" @click="adjustScore('score2', 1)">＋</text>
          </view>
        </view>
      </view>

      <view class="winner-select">
        <text class="label">胜者</text>
        <view class="winner-options">
          <view
            :class="['winner-opt', scoreForm.winnerId === editingGame.player1?.id && 'selected']"
            @click="scoreForm.winnerId = editingGame.player1?.id"
          >{{ editingGame.player1?.name }}</view>
          <view
            :class="['winner-opt', scoreForm.winnerId === editingGame.player2?.id && 'selected']"
            @click="scoreForm.winnerId = editingGame.player2?.id"
          >{{ editingGame.player2?.name }}</view>
        </view>
      </view>

      <button class="save-btn btn-primary" @click="saveScore" :loading="saving">保存比分</button>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMatchStore } from '../../store/modules/match'
import { useUserStore } from '../../store/modules/user'
import { updateScore } from '../../api/match'
import { formatDate } from '../../utils/util'

const matchStore = useMatchStore()
const userStore = useUserStore()
const match = ref(null)
const scorePopupRef = ref(null)
const editingGame = ref(null)
const editingIdx = ref(-1)
const saving = ref(false)
const scoreForm = ref({ score1: 0, score2: 0, winnerId: null })

// 是否是组织者（实际应从后端返回，这里用 userInfo.isOrganizer 模拟）
const isOrganizer = computed(() => !!userStore.userInfo?.isOrganizer)

const statusText = (s) => ({ open:'报名中', ongoing:'进行中', finished:'已结束' }[s] || s)
const typeText  = (t) => ({ round_robin:'循环赛', knockout:'淘汰赛', group:'分组赛' }[t] || t)

// 积分榜计算
const standings = computed(() => {
  if (!match.value || match.value.matchType !== 'round_robin') return []
  const map = {}
  match.value.players?.forEach(p => {
    map[p.id] = { playerId: p.id, name: p.name, wins: 0, losses: 0, points: 0 }
  })
  match.value.games?.forEach(g => {
    if (g.status !== 'finished' || !g.winnerId) return
    const loserId = g.winnerId === g.player1?.id ? g.player2?.id : g.player1?.id
    if (map[g.winnerId]) { map[g.winnerId].wins++; map[g.winnerId].points += 3 }
    if (map[loserId])    { map[loserId].losses++ }
  })
  return Object.values(map).sort((a, b) => b.points - a.points)
})

const getPlayerWins = (pid) => standings.value.find(s => s.playerId === pid)?.wins ?? 0

const openScoreEdit = (game, idx) => {
  editingGame.value = game
  editingIdx.value = idx
  scoreForm.value = {
    score1: game.score1 ?? 0,
    score2: game.score2 ?? 0,
    winnerId: game.winnerId || null
  }
  scorePopupRef.value?.open()
}

const adjustScore = (field, delta) => {
  scoreForm.value[field] = Math.max(0, scoreForm.value[field] + delta)
}

const saveScore = async () => {
  if (!scoreForm.value.winnerId) {
    return uni.showToast({ title: '请选择胜者', icon: 'none' })
  }
  saving.value = true
  try {
    await updateScore(match.value.id, editingGame.value.id, scoreForm.value)
    // 本地更新
    const game = match.value.games[editingIdx.value]
    game.score1 = scoreForm.value.score1
    game.score2 = scoreForm.value.score2
    game.winnerId = scoreForm.value.winnerId
    game.status = 'finished'
    uni.showToast({ title: '比分已保存', icon: 'success' })
    scorePopupRef.value?.close()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const pages = getCurrentPages()
  const page  = pages[pages.length - 1]
  const id = page.options?.id
  if (id) {
    await matchStore.fetchMatchDetail(id)
    match.value = matchStore.currentMatch
  }
})
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.hero {
  background: linear-gradient(135deg, $brand-color, $brand-dark);
  padding: 50rpx 40rpx 40rpx;
  color: #fff;

  .match-name { display: block; font-size: 44rpx; font-weight: bold; margin-bottom: 16rpx; }
  .meta {
    margin-top: 20rpx; display: flex; flex-direction: column; gap: 12rpx;
    &-item { display: flex; align-items: center; font-size: 26rpx; opacity: 0.9;
      .meta-icon { margin-right: 10rpx; } }
  }
}

.section { padding: $space-md; margin: $space-sm; background: #fff; border-radius: $radius-md; box-shadow: $shadow-card;
  &-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: $space-md; }
  .section-title { font-size: 32rpx; font-weight: bold; color: $text-primary; }
  .edit-hint { font-size: 22rpx; color: $text-hint; }
}

.game-row {
  display: flex; align-items: center; padding: 18rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  &:last-child { border-bottom: none; }

  .round-num { width: 50rpx; font-size: 22rpx; color: $text-hint; }

  .players-col {
    flex: 1;
    .pname { font-size: 28rpx; color: $text-primary;
      &.winner { color: $brand-color; font-weight: bold; } }
    &.right { text-align: right; }
  }

  .score-block {
    display: flex; align-items: center; padding: 0 16rpx;
    .score-box {
      display: flex; align-items: center; padding: 8rpx 20rpx;
      border-radius: $radius-sm; background: #f9f9f9;
      &.editable { background: #f0faf4; }
      .score-num { font-size: 36rpx; font-weight: bold; min-width: 40rpx; text-align: center; }
      .score-sep { color: #ccc; margin: 0 8rpx; font-size: 28rpx; }
    }
    .edit-icon { margin-left: 8rpx; font-size: 24rpx; }
  }

  .game-badge {
    font-size: 20rpx; padding: 6rpx 14rpx; border-radius: $radius-full; margin-left: 10rpx;
    &.pending  { background: #fff3e0; color: $color-ongoing; }
    &.ongoing  { background: #e3f2fd; color: #2196f3; }
    &.finished { background: $brand-light; color: $brand-color; }
  }
}

/* 积分榜 */
.standings-header {
  display: flex; padding: 16rpx 0; border-bottom: 2rpx solid #eee;
  font-size: 24rpx; color: $text-hint; font-weight: bold;
}
.standing-row {
  display: flex; padding: 18rpx 0; border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx;
  &.top .rank-col { color: $brand-color; font-weight: bold; }
}
.rank-col  { width: 60rpx; }
.name-col  { flex: 1; }
.stat-col  { width: 70rpx; text-align: center;
  &.win    { color: $brand-color; }
  &.points { font-weight: bold; }
}

/* 参赛名单 */
.player-row {
  display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #f5f5f5;
  &:last-child { border-bottom: none; }
  .avatar { width: 72rpx; height: 72rpx; border-radius: 50%; margin-right: 20rpx; }
  .player-info { flex: 1;
    .pname  { display: block; font-size: 30rpx; color: $text-primary; }
    .plevel { font-size: 24rpx; color: $brand-color; margin-top: 4rpx; }
  }
  .player-wins { font-size: 24rpx; color: $text-hint; }
}

/* 记分弹窗 */
.score-popup {
  padding: $space-lg;
  padding-bottom: calc(#{$space-lg} + env(safe-area-inset-bottom));

  .popup-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: $space-sm;
    .popup-title { font-size: 36rpx; font-weight: bold; }
    .popup-close { font-size: 32rpx; color: $text-hint; padding: 10rpx; }
  }

  .popup-match-name { display: block; font-size: 26rpx; color: $text-hint; margin-bottom: $space-md; }

  .score-input-row {
    display: flex; align-items: center; justify-content: center;
    gap: $space-md; margin-bottom: $space-md;

    .score-side {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: $space-xs;
      .score-player { font-size: 26rpx; color: $text-secondary; }
      .score-stepper {
        display: flex; align-items: center; gap: $space-sm;
        .stepper-btn {
          width: 64rpx; height: 64rpx; background: #f5f5f5; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 36rpx; color: $brand-color; font-weight: bold;
        }
        .score-val { font-size: 64rpx; font-weight: bold; min-width: 80rpx; text-align: center; }
      }
    }
    .vs-label { font-size: 28rpx; color: $text-hint; }
  }

  .winner-select {
    margin-bottom: $space-md;
    .label { display: block; font-size: 28rpx; color: $text-secondary; margin-bottom: $space-xs; }
    .winner-options { display: flex; gap: $space-sm;
      .winner-opt {
        flex: 1; text-align: center; padding: 20rpx; border-radius: $radius-md;
        border: 2rpx solid #eee; font-size: 28rpx; color: $text-secondary;
        &.selected { border-color: $brand-color; background: $brand-light; color: $brand-color; font-weight: bold; }
      }
    }
  }

  .save-btn { height: 96rpx; font-size: 34rpx; }
}

.loading-page {
  display: flex; flex-direction: column; align-items: center; padding-top: 120rpx;
  .loading-text { color: $text-hint; font-size: 26rpx; margin-top: 20rpx; }
}
</style>

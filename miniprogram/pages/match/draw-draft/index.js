const { getSportData } = require('../../../utils/sport-config')
const { api } = require('../../../utils/api')

// ─── 数学工具 ───────────────────────────────────────────────
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }

/**
 * 计算合法的总场数步长和初始场数。
 * 每场4人，N人每人场次相等G，则总场数 = N*G/4
 * G 必须是 (4/gcd(N,4)) 的倍数，步长 step = N/gcd(N,4)
 */
function calcStep(n) {
  const g = gcd(n, 4)
  return n / g  // 每加一个 step，每人多打1场
}

// ─── 排布算法 ───────────────────────────────────────────────
/**
 * 生成每人场次完全相等的排布。
 * @param {Array}  players  [{id, name}, ...]
 * @param {number} total    总场数（必须是 step 的整数倍）
 * @returns {Array} draft   [{idx, team1:[p,p], team2:[p,p]}, ...]
 */
function generateDraft(players, total) {
  const n = players.length
  if (n < 4 || total <= 0) return []

  // 验证：total 必须满足 n*G/4 = total，G 为正整数
  // 即 total * 4 必须能被 n 整除
  if ((total * 4) % n !== 0) return []

  const pairKey = (a, b) => [a, b].sort().join('|')
  const pairCount = {}

  // 每人需要打的场次
  const gamesPerPlayer = (total * 4) / n

  // 场次计数（初始全0）
  const gameCount = {}
  players.forEach(p => { gameCount[p.id] = 0 })

  const draft = []

  for (let i = 0; i < total; i++) {
    // 剩余需要上场的人：场次未满的全部人
    const remaining = players.filter(p => gameCount[p.id] < gamesPerPlayer)

    // 按场次升序 + 随机扰动排序
    remaining.sort((a, b) => {
      const diff = gameCount[a.id] - gameCount[b.id]
      return diff !== 0 ? diff : Math.random() - 0.5
    })

    // 从剩余人里选4人：枚举所有 C(pool, 4) 找搭档重复度最低的组合
    // pool 取前 min(8, remaining.length) 人（场次最少的那批）
    const pool = remaining.slice(0, Math.min(8, remaining.length))
    const pn = pool.length

    let best4 = null
    let bestScore = Infinity

    for (let a = 0; a < pn - 3; a++) {
      for (let b = a + 1; b < pn - 2; b++) {
        for (let c = b + 1; c < pn - 1; c++) {
          for (let d = c + 1; d < pn; d++) {
            const four = [pool[a], pool[b], pool[c], pool[d]]
            // 两种分队方式的搭档重复度
            const s1 = (pairCount[pairKey(four[0].id, four[1].id)] || 0)
                     + (pairCount[pairKey(four[2].id, four[3].id)] || 0)
            const s2 = (pairCount[pairKey(four[0].id, four[2].id)] || 0)
                     + (pairCount[pairKey(four[1].id, four[3].id)] || 0)
            const s3 = (pairCount[pairKey(four[0].id, four[3].id)] || 0)
                     + (pairCount[pairKey(four[1].id, four[2].id)] || 0)
            const score = Math.min(s1, s2, s3)
            if (score < bestScore) {
              bestScore = score
              best4 = { four, s1, s2, s3 }
            }
          }
        }
      }
    }

    if (!best4) break

    const { four, s1, s2, s3 } = best4
    const minS = Math.min(s1, s2, s3)
    let team1, team2
    if (minS === s1) {
      team1 = [four[0], four[1]]; team2 = [four[2], four[3]]
    } else if (minS === s2) {
      team1 = [four[0], four[2]]; team2 = [four[1], four[3]]
    } else {
      team1 = [four[0], four[3]]; team2 = [four[1], four[2]]
    }

    // 更新场次和搭档计数
    ;[...team1, ...team2].forEach(p => { gameCount[p.id]++ })
    pairCount[pairKey(team1[0].id, team1[1].id)] = (pairCount[pairKey(team1[0].id, team1[1].id)] || 0) + 1
    pairCount[pairKey(team2[0].id, team2[1].id)] = (pairCount[pairKey(team2[0].id, team2[1].id)] || 0) + 1

    draft.push({ idx: i, team1, team2 })
  }

  return draft
}

/** 根据 draft 统计每人场次 */
function calcPlayerGames(players, draft) {
  const countMap = {}
  for (const g of draft) {
    for (const p of [...g.team1, ...g.team2]) {
      if (p) countMap[p.id] = (countMap[p.id] || 0) + 1
    }
  }
  return players.map(p => ({ ...p, games: countMap[p.id] || 0 }))
}

// ─── Page ───────────────────────────────────────────────────
Page({
  data: {
    ...getSportData('badminton'),
    matchId: null,
    matchName: '',
    type: '',
    typeName: '',
    draft: [],
    players: [],
    totalRounds: 0,
    step: 1,          // 合法的加减步长
    minRounds: 1,     // 最小合法总场数（= step）
    confirming: false,
  },

  onLoad() {
    const d = getApp().globalData.drawDraft
    if (!d) { wx.navigateBack(); return }
    const sport = wx.getStorageSync('activeSport') || 'badminton'
    const rawPlayers = d.players
    const n = rawPlayers.length
    const step = calcStep(n)

    // 初始场数：后端返回的场数对齐到最近的合法值
    let initRounds = d.draft.length
    if (initRounds % step !== 0) {
      initRounds = Math.round(initRounds / step) * step
      if (initRounds < step) initRounds = step
    }

    const draft = generateDraft(rawPlayers, initRounds)
    const players = calcPlayerGames(rawPlayers, draft)

    this.setData({
      ...getSportData(sport),
      matchId: d.matchId,
      matchName: d.matchName,
      type: d.type,
      typeName: d.typeName,
      draft,
      players,
      totalRounds: initRounds,
      step,
      minRounds: step,
      _rawPlayers: rawPlayers,
    })
  },

  decRounds() {
    const { totalRounds, step, minRounds } = this.data
    if (totalRounds - step < minRounds) return
    this._setRounds(totalRounds - step)
  },

  incRounds() {
    const { totalRounds, step } = this.data
    this._setRounds(totalRounds + step)
  },

  _setRounds(n) {
    const { _rawPlayers } = this.data
    const draft = generateDraft(_rawPlayers, n)
    const players = calcPlayerGames(_rawPlayers, draft)
    this.setData({ totalRounds: n, draft, players })
  },

  onPlayerTap(e) {
    const { gameIdx, team, slot } = e.currentTarget.dataset
    const { draft, players } = this.data
    const game = draft[gameIdx]
    const curPlayer = game[team][slot]

    const usedIds = new Set()
    ;[...game.team1, ...game.team2].forEach(p => { if (p) usedIds.add(p.id) })
    if (curPlayer) usedIds.delete(curPlayer.id)

    const available = players.filter(p => !usedIds.has(p.id) || (curPlayer && p.id === curPlayer.id))
    if (!available.length) { wx.showToast({ title: '没有可替换的选手', icon: 'none' }); return }

    wx.showActionSheet({
      itemList: available.map(p => `${p.name}（${p.games}场）`),
      success: (res) => {
        const picked = available[res.tapIndex]
        if (curPlayer && picked.id === curPlayer.id) return
        this._swap(gameIdx, team, slot, picked, curPlayer)
      }
    })
  },

  _swap(gameIdx, team, slot, newPlayer, oldPlayer) {
    const draft = JSON.parse(JSON.stringify(this.data.draft))
    let foundGame = null, foundTeam = null, foundSlot = null
    for (const g of draft) {
      for (const t of ['team1', 'team2']) {
        for (let s = 0; s < g[t].length; s++) {
          if (g[t][s] && g[t][s].id === newPlayer.id) {
            foundGame = g.idx; foundTeam = t; foundSlot = s
          }
        }
      }
    }
    draft[gameIdx][team][slot] = { id: newPlayer.id, name: newPlayer.name }
    if (foundGame !== null) {
      draft[foundGame][foundTeam][foundSlot] = oldPlayer ? { id: oldPlayer.id, name: oldPlayer.name } : null
    }
    const players = calcPlayerGames(this.data._rawPlayers, draft)
    this.setData({ draft, players })
  },

  navigateBack() { wx.navigateBack() },

  reshufle() {
    const { totalRounds, _rawPlayers } = this.data
    const draft = generateDraft(_rawPlayers, totalRounds)
    const players = calcPlayerGames(_rawPlayers, draft)
    this.setData({ draft, players })
  },

  async confirm() {
    const { matchId, type, draft, confirming, totalRounds } = this.data
    if (confirming) return
    const res = await wx.showModal({ title: '确认开始比赛', content: `共 ${totalRounds} 场，确认排布并开始？` })
    if (!res.confirm) return
    this.setData({ confirming: true })
    try {
      await api.confirmDraw(matchId, type, draft)
      wx.showToast({ title: '比赛已开始！', icon: 'success' })
      setTimeout(() => { wx.navigateBack() }, 1200)
    } catch(e) {
      wx.showToast({ title: (e && e.data && e.data.message) || '开始失败', icon: 'none' })
    } finally {
      this.setData({ confirming: false })
    }
  }
})

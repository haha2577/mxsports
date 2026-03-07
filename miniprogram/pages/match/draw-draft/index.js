const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
const { api } = require('../../../utils/api')
Page({
  data: {
    heroGrad:GRAD_B,
    matchId: null,
    matchName: '',
    type: '',
    typeName: '',
    draft: [],      // [{idx, team1:[{id,name}|null, ...], team2:[...]}]
    players: [],    // [{id, name, games}]
    swapping: null, // {gameIdx, team:'team1'|'team2', slot:0|1}
    confirming: false},

  onLoad() {
    
    const d = getApp().globalData.drawDraft
    if (!d) { wx.navigateBack(); return }
    const sport=wx.getStorageSync('activeSport')||'badminton'
    this.setData({
      heroGrad:sport==='tennis'?GRAD_T:GRAD_B,
      matchId: d.matchId,
      matchName: d.matchName,
      type: d.type,
      typeName: d.typeName,
      draft: d.draft,
      players: d.players})
  },

  // 点击选手名字 → 选择替换
  onPlayerTap(e) {
    const { gameIdx, team, slot } = e.currentTarget.dataset
    const { draft, players } = this.data
    const game = draft[gameIdx]
    const curPlayer = game[team][slot]

    // 构造 action sheet 选项（排除当前这场已有的人）
    const usedIds = new Set()
    ;[...game.team1, ...game.team2].forEach(p => { if (p) usedIds.add(p.id) })
    if (curPlayer) usedIds.delete(curPlayer.id) // 可以选自己（=不换）

    const available = players.filter(p => !usedIds.has(p.id) || (curPlayer && p.id === curPlayer.id))
    if (!available.length) { wx.showToast({ title: '没有可替换的选手', icon: 'none' }); return }

    wx.showActionSheet({
      itemList: available.map(p => `${p.name}（${p.games}场）`),
      success: (res) => {
        const picked = available[res.tapIndex]
        if (curPlayer && picked.id === curPlayer.id) return
        this._swap(gameIdx, team, slot, picked, curPlayer)
      }})
  },

  // 交换两个选手在排布中的位置
  _swap(gameIdx, team, slot, newPlayer, oldPlayer) {
    const draft = JSON.parse(JSON.stringify(this.data.draft))
    // 找 newPlayer 当前在哪场哪个位置
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
    // 将目标格设为 newPlayer
    draft[gameIdx][team][slot] = { id: newPlayer.id, name: newPlayer.name }
    // 将 newPlayer 原来的格设为 oldPlayer（或清空）
    if (foundGame !== null) {
      draft[foundGame][foundTeam][foundSlot] = oldPlayer ? { id: oldPlayer.id, name: oldPlayer.name } : null
    }
    // 更新场次统计
    const countMap = {}
    for (const g of draft) {
      for (const p of [...g.team1, ...g.team2]) {
        if (p) countMap[p.id] = (countMap[p.id] || 0) + 1
      }
    }
    const players = this.data.players.map(p => ({ ...p, games: countMap[p.id] || 0 }))
    this.setData({ draft, players })
  },

  navigateBack() { wx.navigateBack() },
  // 重新随机
  async reshufle() {
    const { matchId, type } = this.data
    wx.showLoading({ title: '重新随机...' })
    try {
      const r = await api.previewDraw(matchId, type)
      const { draft, players } = r.data.data
      this.setData({ draft, players })
    } catch(e) {
      wx.showToast({ title: '随机失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  // 确认开始
  async confirm() {
    const { matchId, type, draft, confirming } = this.data
    if (confirming) return
    const res = await wx.showModal({ title: '确认开始比赛', content: `共 ${draft.length} 场，确认排布并开始？` })
    if (!res.confirm) return
    this.setData({ confirming: true })
    try {
      await api.confirmDraw(matchId, type, draft)
      wx.showToast({ title: '比赛已开始！', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1200)
    } catch(e) {
      wx.showToast({ title: (e && e.data && e.data.message) || '开始失败', icon: 'none' })
    } finally {
      this.setData({ confirming: false })
    }
  }})

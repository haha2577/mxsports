const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
const { api } = require('../../../utils/api')
const { fmtTime } = require('../../../utils/time')
Page({
  data: {
    
    heroGrad:GRAD_B,
    id: null,
    match: null,
    loading: true,
    registering: false,
    isRegistered: false,
    isOrganizer: false,
    myUserId: null,
    statusMap: { open: '报名中', paused: '已暂停', ongoing: '进行中', finished: '已结束', draft: '草稿', cancelled: '已取消' },
    showFormatSheet: false,
    formats: [
      { type: 'rotation_doubles', name: '多人轮转双打', desc: '随机配对，所有组合循环对阵', enabled: true },
      { type: 'round_robin',      name: '单打循环赛',   desc: '敬请期待', enabled: false },
      { type: 'knockout',         name: '单打淘汰赛',   desc: '敬请期待', enabled: false },
      { type: 'team',             name: '团体赛',       desc: '敬请期待', enabled: false },
    ],
    levelMap:  { open: 'status-open', ongoing: 'status-ongoing', finished: 'status-done', draft: 'status-draft' },
    games: [],
    leaderboard: [],
    showScoreModal: false,
    editingGame: null,
    editScore1: '',
    editScore2: '',
    showPlayerSheet: false},

  onLoad(opts) {
    this.setData({ id: opts.id })
    this._load()
  },

  onShow() {
    if (this.data.id && !this.data.loading) this._load()
  },

  navigateBack() { wx.navigateBack() },
  togglePlayerSheet() { this.setData({ showPlayerSheet: !this.data.showPlayerSheet }) },

  async _loadGames() {
    const { id, match } = this.data
    if (!match || match.status !== 'ongoing' && match.status !== 'finished') return
    try {
      const [gr, lr] = await Promise.all([api.matchGames(id), api.leaderboard(id)])
      this.setData({ games: gr.data.data || [], leaderboard: lr.data.data || [] })
    } catch(e) {}
  },

  async _load() {
    const { id } = this.data
    if (!id) return
    this.setData({ loading: true })
    try {
      const r = await api.matchDetail(id)
      const match = r.data.data
      const token = wx.getStorageSync('token')
      const userInfo = wx.getStorageSync('userInfo') || {}
      const myId = userInfo.id || null
      const isOrganizer = myId && match.organizerId === myId
      // 检查是否已报名
      const isRegistered = token && match.players && match.players.some(p => p.id === myId)
      const fmtMatch = { ...match, startTime: fmtTime(match.startTime) }
      this.setData({ match: fmtMatch, loading: false, myUserId: myId, isOrganizer, isRegistered, heroGrad:match.sport==='tennis'?GRAD_T:GRAD_B })
      this._loadGames()
    } catch(e) {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async doRegister() {
    const token = wx.getStorageSync('token')
    if (!token) { wx.showToast({ title: '请先登录', icon: 'none' }); return }
    const { id, registering, isRegistered } = this.data
    if (registering) return
    this.setData({ registering: true })
    try {
      if (isRegistered) {
        await wx.showModal({ title: '取消报名', content: '确定要取消报名吗？' })
        await api.cancelRegister(id)
        wx.showToast({ title: '已取消报名', icon: 'success' })
        this.setData({ isRegistered: false })
      } else {
        await api.register(id)
        wx.showToast({ title: '报名成功！', icon: 'success' })
        this.setData({ isRegistered: true })
      }
      this._load()
    } catch(e) {
      const msg = e && e.data && e.data.message ? e.data.message : (isRegistered ? '取消失败' : '报名失败')
      wx.showToast({ title: msg, icon: 'none' })
    } finally {
      this.setData({ registering: false })
    }
  },

  // ─── 记分相关（内联编辑）───────────────────────────────
  _pendingScores: {},

  onScoreTap(e) {
    // 空操作，让 input 获焦
  },

  onScoreInput(e) {
    const { gameId, team } = e.currentTarget.dataset
    if (!this._pendingScores) this._pendingScores = {}
    if (!this._pendingScores[gameId]) this._pendingScores[gameId] = {}
    this._pendingScores[gameId]['score' + team] = e.detail.value
  },

  async onScoreBlur(e) {
    const { gameId, team } = e.currentTarget.dataset
    const val = e.detail.value
    if (!this._pendingScores) this._pendingScores = {}
    if (!this._pendingScores[gameId]) this._pendingScores[gameId] = {}
    this._pendingScores[gameId]['score' + team] = val

    // 找到这场比赛当前的分数
    const game = this.data.games.find(g => g.id == gameId)
    if (!game) return

    const s1 = this._pendingScores[gameId].score1 != null ? this._pendingScores[gameId].score1 : (game.score1 != null ? String(game.score1) : '')
    const s2 = this._pendingScores[gameId].score2 != null ? this._pendingScores[gameId].score2 : (game.score2 != null ? String(game.score2) : '')

    // 两边都有值时自动保存
    if (s1 !== '' && s2 !== '') {
      try {
        await api.updateScore(this.data.id, gameId, parseInt(s1), parseInt(s2))
        wx.showToast({ title: '已保存', icon: 'success', duration: 1000 })
        delete this._pendingScores[gameId]
        this._loadGames()
      } catch(e) {
        wx.showToast({ title: (e && e.data && e.data.message) || '保存失败', icon: 'none' })
      }
    }
  },

  // 保留弹窗方式作为备用
  openScoreModal(e) {
    const game = e.currentTarget.dataset.game
    this.setData({ showScoreModal: true, editingGame: game,
      editScore1: game.score1 != null ? String(game.score1) : '',
      editScore2: game.score2 != null ? String(game.score2) : '' })
  },
  closeScoreModal() { this.setData({ showScoreModal: false, editingGame: null }) },
  onScore1(e) { this.setData({ editScore1: e.detail.value }) },
  onScore2(e) { this.setData({ editScore2: e.detail.value }) },
  async submitScore() {
    const { id, editingGame, editScore1, editScore2 } = this.data
    if (editScore1 === '' || editScore2 === '') {
      wx.showToast({ title: '请填写双方比分', icon: 'none' }); return
    }
    try {
      await api.updateScore(id, editingGame.id, parseInt(editScore1), parseInt(editScore2))
      this.setData({ showScoreModal: false })
      wx.showToast({ title: '比分已保存', icon: 'success' })
      this._loadGames()
    } catch(e) {
      wx.showToast({ title: (e && e.data && e.data.message) || '保存失败', icon: 'none' })
    }
  },

  // ─── 结束比赛 ───────────────────────────────────────────
  async finishMatch() {
    const res = await wx.showModal({ title: '结束比赛', content: '确认结束本场比赛？结束后将无法修改比分。' })
    if (!res.confirm) return
    try {
      await api.finishMatch(this.data.id)
      wx.showToast({ title: '比赛已结束', icon: 'success' })
      this._load()
    } catch(e) {
      wx.showToast({ title: (e && e.data && e.data.message) || '操作失败', icon: 'none' })
    }
  },

  openFormatSheet() { this.setData({ showFormatSheet: true }) },
  closeFormatSheet() { this.setData({ showFormatSheet: false }) },

  async selectFormat(e) {
    const fmt = e.currentTarget.dataset.fmt
    if (!fmt.enabled) return
    this.setData({ showFormatSheet: false })
    const { id, match } = this.data
    const count = match.registeredCount || 0
    if (count < 4) {
      wx.showToast({ title: `至少需要4名报名选手（当前${count}人）`, icon: 'none' }); return
    }
    wx.showLoading({ title: '生成排布中...' })
    try {
      const r = await api.previewDraw(id, fmt.type)
      const { draft, players } = r.data.data
      wx.hideLoading()
      // 传数据到草稿页
      getApp().globalData.drawDraft = { matchId: id, matchName: match.name, type: fmt.type, typeName: fmt.name, draft, players }
      wx.navigateTo({ url: '/pages/match/draw-draft/index' })
    } catch(e) {
      wx.hideLoading()
      wx.showToast({ title: (e && e.data && e.data.message) || '生成失败', icon: 'none' })
    }
  },

  async adminRemove(e) {
    const { regId, name } = e.currentTarget.dataset
    const { id } = this.data
    const res = await wx.showModal({ title: '移除报名', content: `确定移除 ${name} 的报名吗？` })
    if (!res.confirm) return
    try {
      await api.adminCancelReg(id, regId)
      wx.showToast({ title: '已移除', icon: 'success' })
      this._load()
    } catch(e) {
      wx.showToast({ title: (e && e.data && e.data.message) || '操作失败', icon: 'none' })
    }
  },

  async pauseMatch() {
    const { id } = this.data
    try {
      await api.matchAction(id, 'pause')
      wx.showToast({ title: '已暂停报名', icon: 'success' })
      this._load()
    } catch(e) {
      wx.showToast({ title: (e && e.data && e.data.message) || '操作失败', icon: 'none' })
    }
  },

  async resumeMatch() {
    const { id } = this.data
    try {
      await api.matchAction(id, 'resume')
      wx.showToast({ title: '已恢复报名', icon: 'success' })
      this._load()
    } catch(e) {
      wx.showToast({ title: (e && e.data && e.data.message) || '操作失败', icon: 'none' })
    }
  },

  async cancelMatch() {
    const { id } = this.data
    const res = await wx.showModal({ title: '取消活动', content: '确定取消？取消后可以彻底删除。' })
    if (!res.confirm) return
    try {
      await api.matchAction(id, 'cancel')
      wx.showToast({ title: '活动已取消', icon: 'success' })
      this._load()
    } catch(e) {
      wx.showToast({ title: (e && e.data && e.data.message) || '操作失败', icon: 'none' })
    }
  },

  async deleteMatch() {
    const { id } = this.data
    const res = await wx.showModal({ title: '彻底删除', content: '删除后无法恢复，确定吗？', confirmColor: '#e53935' })
    if (!res.confirm) return
    try {
      await api.deleteMatch(id)
      wx.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch(e) {
      wx.showToast({ title: (e && e.data && e.data.message) || '删除失败', icon: 'none' })
    }
  },

  shareMatch() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage'] })
    wx.showToast({ title: '点击右上角分享', icon: 'none' })
  },

  onShareAppMessage() {
    const { match, id } = this.data
    return {
      title: match ? match.name : '快来参加我的活动！',
      path: `/pages/match/detail/index?id=${id}`}
  },

  _fmt(dt) {
    if (!dt) return ''
    const d = new Date(dt)
    return `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }})

const { api } = require('../../../utils/api')
Page({
  data: {
    sport: 'badminton',
    sportPref: '',
    // 必填
    name: '',
    date: '',
    time: '',
    location: '',
    // 可选
    maxPlayers: 8,
    fee: '',
    level: '',
    // 选项
    maxOptions: [4, 6, 8, 10, 12, 16],
    levelOptions: ['不限', '入门', '业余', '中级', '高级'],
    // 状态
    loading: false,
    showSuccess: false,
    createdId: null,
    // 今天日期（date picker 最小值）
    today: '',
  },
  onLoad() {
    const pref = wx.getStorageSync('sportPref') || ''
    const sport = pref === 'both' ? (wx.getStorageSync('activeSport') || 'badminton') : (pref || wx.getStorageSync('activeSport') || 'badminton')
    this.setData({ sportPref: pref })
    const now = new Date()

    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    // 默认明天
    const tom = new Date(now.getTime() + 86400000)
    const defaultDate = `${tom.getFullYear()}-${String(tom.getMonth()+1).padStart(2,'0')}-${String(tom.getDate()).padStart(2,'0')}`
    this.setData({ sport, today, date: defaultDate, time: '09:00' })
  },
  onName(e) { this.setData({ name: e.detail.value }) },
  onDate(e) { this.setData({ date: e.detail.value }) },
  onTime(e) { this.setData({ time: e.detail.value }) },
  onLocation(e) { this.setData({ location: e.detail.value }) },
  onFee(e) { this.setData({ fee: e.detail.value }) },
  setMax(e) { this.setData({ maxPlayers: e.currentTarget.dataset.v }) },
  setLevel(e) { this.setData({ level: e.currentTarget.dataset.v }) },
  setSport(e) { this.setData({ sport: e.currentTarget.dataset.v }) },

  async submit() {
    const { sport, name, date, time, location, maxPlayers, fee, level, loading } = this.data
    if (!name.trim()) { wx.showToast({ title: '请填写活动名称', icon: 'none' }); return }
    if (!date)        { wx.showToast({ title: '请选择活动日期', icon: 'none' }); return }
    if (!location.trim()) { wx.showToast({ title: '请填写活动地点', icon: 'none' }); return }
    if (loading) return
    this.setData({ loading: true })
    try {
      const startTime = `${date}T${time || '09:00'}:00`
      const r = await api.createMatch({
        sport,
        name: name.trim(),
        location: location.trim(),
        startTime,
        maxPlayers,
        fee: fee ? parseFloat(fee) : 0,
        levels: level && level !== '不限' ? [level] : [],
        status: 'open',
        matchType: 'round_robin',
      })
      this.setData({ createdId: r.data.data.id, showSuccess: true })
    } catch(e) {
      const msg = e && e.data && e.data.message ? e.data.message : '创建失败，请重试'
      wx.showToast({ title: msg, icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  shareNow() {
    // 触发页面级 onShareAppMessage
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage'] })
    wx.showToast({ title: '点击右上角分享', icon: 'none' })
  },
  goDetail() {
    wx.redirectTo({ url: `/pages/match/detail/index?id=${this.data.createdId}` })
  },
  closeSuccess() {
    this.setData({ showSuccess: false })
    this.goDetail()
  },

  onShareAppMessage() {
    return {
      title: this.data.name || '快来参加我的活动！',
      path: `/pages/match/detail/index?id=${this.data.createdId}`,
    }
  },
})

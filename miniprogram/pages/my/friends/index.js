const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
const { api } = require('../../../utils/api')
Page({
  data: { heroGrad:GRAD_B, list: [], loading: true },
  onLoad() {
    const _s=wx.getStorageSync('activeSport')||'badminton';this.setData({heroGrad:_s==='tennis'?GRAD_T:GRAD_B})
    this._load()
  },
  onShow() { this._load() },
  async _load() {
    this.setData({ loading: true })
    try {
      const r = await api.friends()
      this.setData({ list: r.data.data || [] })
    } catch(e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },
  navigateBack() { wx.navigateBack() },
  goMatch(e) {
    wx.navigateTo({ url: '/pages/match/detail/index?id=' + e.currentTarget.dataset.id })
  },
  _fmtTime(dt) {
    if (!dt) return ''
    const d = new Date(dt)
    const weeks = ['周日','周一','周二','周三','周四','周五','周六']
    return `${d.getMonth()+1}月${d.getDate()}日（${weeks[d.getDay()]}）`
  }})

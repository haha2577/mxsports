const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
const { api } = require('../../../utils/api')
const { fmtDate } = require('../../../utils/time')
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
      const list = (r.data.data || []).map(f => ({
        ...f,
        lastMatch: f.lastMatch ? { ...f.lastMatch, startTime: fmtDate(f.lastMatch.startTime) } : null
      }))
      this.setData({ list })
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
})

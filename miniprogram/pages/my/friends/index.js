const { applySport, getSportData } = require('../../../utils/sport-config')
const { api } = require('../../../utils/api')
const { fmtDate } = require('../../../utils/time')
Page({
  data: { ...getSportData("badminton"), list: [], loading: true },
  onLoad() {
    applySport(this)
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

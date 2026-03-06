const { api } = require('../../../utils/api')
Page({
  data: { sbh: 20, list: [], loading: true },
  onLoad() {
    try{this.setData({sbh:wx.getSystemInfoSync().statusBarHeight||20})}catch(e){}
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
  },
})

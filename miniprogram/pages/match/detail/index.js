const { api } = require('../../../utils/api')

Page({
  data: {
    id: null,
    match: null,
    loading: true,
    registering: false,
    isRegistered: false,
    isOrganizer: false,
    myUserId: null,
    statusMap: { open: '报名中', paused: '已暂停', ongoing: '进行中', finished: '已结束', draft: '草稿', cancelled: '已取消' },
    levelMap:  { open: 'status-open', ongoing: 'status-ongoing', finished: 'status-done', draft: 'status-draft' },
  },

  onLoad(opts) {
    this.setData({ id: opts.id })
    this._load()
  },

  onShow() {
    if (this.data.id && !this.data.loading) this._load()
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
      this.setData({ match, loading: false, myUserId: myId, isOrganizer, isRegistered })
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

  async pauseMatch() {
    const { id } = this.data
    try {
      await api.matchAction(id, 'pause')
      wx.showToast({ title: '已暂停报名', icon: 'success' })
      this._load()
    } catch(e) {
      wx.showToast({ title: e?.data?.message || '操作失败', icon: 'none' })
    }
  },

  async resumeMatch() {
    const { id } = this.data
    try {
      await api.matchAction(id, 'resume')
      wx.showToast({ title: '已恢复报名', icon: 'success' })
      this._load()
    } catch(e) {
      wx.showToast({ title: e?.data?.message || '操作失败', icon: 'none' })
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
      wx.showToast({ title: e?.data?.message || '操作失败', icon: 'none' })
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
      wx.showToast({ title: e?.data?.message || '删除失败', icon: 'none' })
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
      path: `/pages/match/detail/index?id=${id}`,
    }
  },

  _fmt(dt) {
    if (!dt) return ''
    const d = new Date(dt)
    return `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  },
})

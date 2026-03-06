const { api } = require('../../../utils/api')
Page({
  data: {
    sbh: 20,
    sport: 'badminton',
    sportPref: '',
    // 必填
    name: '',
    date: '',
    dateDisplay: '',
    time: '09:00',
    timeDisplay: '09:00',
    location: '',      // 传给后端（场馆名）
    locationName: '',  // 展示名
    locationAddr: '',  // 详细地址（副标题）
    locationLat: null,
    locationLng: null,
    // 可选
    maxPlayers: 8,
    fee: '',
    level: '',
    // 选项
    maxOptions: [4, 6, 8, 10, 12, 16],
    levelOptions: ['不限', '入门', '业余', '中级', '高级'],
    // 时间多列
    timeColumns: [
      Array.from({length:24}, (_,i) => `${String(i).padStart(2,'0')}时`),
      ['00分','15分','30分','45分'],
    ],
    timeIndex: [9, 0],
    // 状态
    loading: false,
    showSuccess: false,
    createdId: null,
    today: '',
  },
  onLoad() {
    try{this.setData({sbh:wx.getSystemInfoSync().statusBarHeight||20})}catch(e){}
    const pref = wx.getStorageSync('sportPref') || ''
    const sport = pref === 'both' ? (wx.getStorageSync('activeSport') || 'badminton') : (pref || wx.getStorageSync('activeSport') || 'badminton')
    this.setData({ sportPref: pref })
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    const tom = new Date(now.getTime() + 86400000)
    const defaultDate = `${tom.getFullYear()}-${String(tom.getMonth()+1).padStart(2,'0')}-${String(tom.getDate()).padStart(2,'0')}`
    this.setData({ sport, today, date: defaultDate, dateDisplay: this._fmtDate(defaultDate) })
  },
  onName(e) { this.setData({ name: e.detail.value }) },
  onDate(e) { const d = e.detail.value; this.setData({ date: d, dateDisplay: this._fmtDate(d) }) },
  _fmtDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    const weeks = ['周日','周一','周二','周三','周四','周五','周六']
    return `${d.getMonth()+1}月${d.getDate()}日（${weeks[d.getDay()]}）`
  },
  onTimeChange(e) {
    const [hi, mi] = e.detail.value
    const mins = ['00','15','30','45']
    const timeDisplay = `${String(hi).padStart(2,'0')}:${mins[mi]}`
    this.setData({ timeIndex: [hi, mi], timeDisplay, time: timeDisplay })
  },
  pickLocation() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] === false) {
          wx.showModal({
            title: '需要定位权限',
            content: '请在设置中开启位置权限，以便搜索附近场馆',
            confirmText: '去设置',
            success: (r) => { if (r.confirm) wx.openSetting() },
          })
          return
        }
        this._doPickLocation()
      },
    })
  },
  _doPickLocation() {
    wx.chooseLocation({
      success: (res) => {
        const name = res.name || res.address
        const addr = res.name ? res.address : ''
        this.setData({
          locationName: name,
          locationAddr: addr,
          location: name + (addr ? ` ${addr}` : ''),
          locationLat: res.latitude,
          locationLng: res.longitude,
        })
      },
      fail: () => {},
    })
  },
  clearLocation() {
    this.setData({ location: '', locationName: '', locationAddr: '', locationLat: null, locationLng: null })
  },
  onFee(e) { this.setData({ fee: e.detail.value }) },
  setMax(e) { this.setData({ maxPlayers: e.currentTarget.dataset.v }) },
  setLevel(e) { this.setData({ level: e.currentTarget.dataset.v }) },
  setSport(e) { this.setData({ sport: e.currentTarget.dataset.v }) },

  async submit() {
    const { sport, name, date, time, location, locationLat, locationLng, maxPlayers, fee, level, loading } = this.data
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
        lat: locationLat,
        lng: locationLng,
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
  navigateBack() { wx.navigateBack() },
  onShareAppMessage() {
    return {
      title: this.data.name || '快来参加我的活动！',
      path: `/pages/match/detail/index?id=${this.data.createdId}`,
    }
  },
})

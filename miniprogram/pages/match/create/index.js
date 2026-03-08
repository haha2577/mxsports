const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
const { api } = require('../../../utils/api')
Page({
  data: {
    heroGrad:GRAD_B,
    
    sport: 'badminton',
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
    // 日期多列
    dateColumns: [[], [], []],
    dateIndex: [0, 0, 0],
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
    today: ''},
  onLoad() {
    const sport = wx.getStorageSync('activeSport') || 'badminton'
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    // 默认明天
    const tom = new Date(now.getTime() + 86400000)
    const defaultDate = `${tom.getFullYear()}-${String(tom.getMonth()+1).padStart(2,'0')}-${String(tom.getDate()).padStart(2,'0')}`
    const { columns, index } = this._buildDateColumns(today, defaultDate)
    this.setData({
      sport, heroGrad: sport==='tennis'?GRAD_T:GRAD_B,
      today,
      date: defaultDate,
      dateDisplay: this._fmtDate(defaultDate),
      dateColumns: columns,
      dateIndex: index,
    })
  },

  // 构造日期三列：[年列, 月列, 日+星期列]，并计算初始 index
  _buildDateColumns(todayStr, selectedStr) {
    const WEEKS = ['周日','周一','周二','周三','周四','周五','周六']
    const todayD = new Date(todayStr + 'T00:00:00')
    const selD   = new Date((selectedStr || todayStr) + 'T00:00:00')

    // 年：今年 ~ 今年+2
    const startYear = todayD.getFullYear()
    const years = [startYear, startYear+1, startYear+2].map(y => `${y}年`)

    const selYear  = selD.getFullYear()
    const selMonth = selD.getMonth() // 0-based
    const selDay   = selD.getDate()

    const yi = Math.max(0, selYear - startYear)

    // 月：若是今年，从今月开始；否则从1月
    const minMonth = (startYear + yi === todayD.getFullYear()) ? todayD.getMonth() : 0
    const months = Array.from({length: 12 - minMonth}, (_, i) => `${String(minMonth+i+1).padStart(2,'0')}月`)
    const mi = Math.max(0, selMonth - minMonth)

    // 日：计算该月天数，若是今年今月，从今天开始
    const curYear  = startYear + yi
    const curMonth = minMonth + mi  // 0-based
    const daysInMonth = new Date(curYear, curMonth+1, 0).getDate()
    const minDay = (curYear === todayD.getFullYear() && curMonth === todayD.getMonth()) ? todayD.getDate() : 1
    const days = Array.from({length: daysInMonth - minDay + 1}, (_, i) => {
      const d = new Date(curYear, curMonth, minDay + i)
      return `${String(minDay+i).padStart(2,'0')}日（${WEEKS[d.getDay()]}）`
    })
    const di = Math.max(0, selDay - minDay)

    return { columns: [years, months, days], index: [yi, mi, di] }
  },

  onName(e) { this.setData({ name: e.detail.value }) },

  // 滚动某一列时，动态更新其他列（主要是年/月变化时重算日列）
  onDateColumnChange(e) {
    const { column, value } = e.detail
    const idx = [...this.data.dateIndex]
    idx[column] = value
    // 触发完整重算，传入当前三列 index
    this._updateDateColumns(idx[0], idx[1], idx[2])
  },

  _updateDateColumns(yi, mi, di) {
    const WEEKS = ['周日','周一','周二','周三','周四','周五','周六']
    const todayD = new Date(this.data.today + 'T00:00:00')
    const startYear = todayD.getFullYear()
    const curYear = startYear + yi
    const minMonth = (curYear === todayD.getFullYear()) ? todayD.getMonth() : 0
    const months = Array.from({length: 12 - minMonth}, (_, i) => `${String(minMonth+i+1).padStart(2,'0')}月`)
    const safeM = Math.min(mi, months.length - 1)
    const curMonth = minMonth + safeM
    const daysInMonth = new Date(curYear, curMonth+1, 0).getDate()
    const minDay = (curYear === todayD.getFullYear() && curMonth === todayD.getMonth()) ? todayD.getDate() : 1
    const days = Array.from({length: daysInMonth - minDay + 1}, (_, i) => {
      const d = new Date(curYear, curMonth, minDay + i)
      return `${String(minDay+i).padStart(2,'0')}日（${WEEKS[d.getDay()]}）`
    })
    const safeD = Math.min(di, days.length - 1)
    this.setData({
      dateColumns: [this.data.dateColumns[0], months, days],
      dateIndex: [yi, safeM, safeD],
    })
  },

  onDateChange(e) {
    const [yi, mi, di] = e.detail.value
    const WEEKS = ['周日','周一','周二','周三','周四','周五','周六']
    const todayD = new Date(this.data.today + 'T00:00:00')
    const startYear = todayD.getFullYear()
    const curYear = startYear + yi
    const minMonth = (curYear === todayD.getFullYear()) ? todayD.getMonth() : 0
    const curMonth = minMonth + mi  // 0-based
    const daysInMonth = new Date(curYear, curMonth+1, 0).getDate()
    const minDay = (curYear === todayD.getFullYear() && curMonth === todayD.getMonth()) ? todayD.getDate() : 1

    // 重新生成月列、日列（年变化时月列起点可能变）
    const months = Array.from({length: 12 - minMonth}, (_, i) => `${String(minMonth+i+1).padStart(2,'0')}月`)
    const days = Array.from({length: daysInMonth - minDay + 1}, (_, i) => {
      const d = new Date(curYear, curMonth, minDay + i)
      return `${String(minDay+i).padStart(2,'0')}日（${WEEKS[d.getDay()]}）`
    })

    // 修正越界
    const safeM = Math.min(mi, months.length - 1)
    const safeD = Math.min(di, days.length - 1)
    const realDay = minDay + safeD

    const dateStr = `${curYear}-${String(curMonth+1).padStart(2,'0')}-${String(realDay).padStart(2,'0')}`
    const displayD = new Date(curYear, curMonth, realDay)
    const dateDisplay = `${curMonth+1}月${realDay}日（${WEEKS[displayD.getDay()]}）`

    this.setData({
      dateColumns: [this.data.dateColumns[0], months, days],
      dateIndex: [yi, safeM, safeD],
      date: dateStr,
      dateDisplay,
    })
  },

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
            success: (r) => { if (r.confirm) wx.openSetting() }})
          return
        }
        this._doPickLocation()
      }})
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
          locationLng: res.longitude})
      },
      fail: () => {}})
  },
  clearLocation() {
    this.setData({ location: '', locationName: '', locationAddr: '', locationLat: null, locationLng: null })
  },
  onFee(e) { this.setData({ fee: e.detail.value }) },
  setMax(e) { this.setData({ maxPlayers: e.currentTarget.dataset.v }) },
  setLevel(e) { this.setData({ level: e.currentTarget.dataset.v }) },

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
        matchType: 'round_robin'})
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
      path: `/pages/match/detail/index?id=${this.data.createdId}`}
  }})

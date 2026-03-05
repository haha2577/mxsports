App({
  onLaunch() {
    const token    = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (token)    this.globalData.token    = token
    if (userInfo) this.globalData.userInfo = userInfo
    this.globalData.lang = 'zh'
  },
  globalData: { token: '', userInfo: null, lang: 'zh' }
})

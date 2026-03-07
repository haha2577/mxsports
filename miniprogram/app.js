App({
  onLaunch() {
    const token    = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (token)    this.globalData.token    = token
    if (userInfo) this.globalData.userInfo = userInfo

    // 从 userInfo 恢复 activeSport（以数据库为准）
    if (userInfo && userInfo.activeSport) {
      wx.setStorageSync('activeSport', userInfo.activeSport)
    } else if (userInfo && userInfo.sportPref && userInfo.sportPref !== 'both') {
      // 单项用户：activeSport 与 sportPref 保持一致
      wx.setStorageSync('activeSport', userInfo.sportPref)
    }
    this.globalData.lang = 'zh'
  },
  globalData: { token: '', userInfo: null, lang: 'zh' }
})

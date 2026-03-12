App({
  onLaunch() {
    const token    = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (token)    this.globalData.token    = token
    if (userInfo) this.globalData.userInfo = userInfo

    // 初始化本地运动状态（以服务端数据为准）
    if (userInfo) {
      // activeSport：服务端有就用，否则从 sportPref 派生
      const activeSport = userInfo.activeSport
        || (userInfo.sportPref && userInfo.sportPref !== 'both' ? userInfo.sportPref : 'badminton')
      wx.setStorageSync('activeSport', activeSport)
      // canSwitch：是否双栖用户（只有 both 才显示切换入口）
      wx.setStorageSync('canSwitch', userInfo.sportPref === 'both')
    }
    this.globalData.lang = 'zh'
    try {
      const env = require('./utils/env.js')
      this.globalData.showVideoEntry  = !!env.SHOW_VIDEO_ENTRY
      this.globalData.showRacketEntry = !!env.SHOW_RACKET_ENTRY
      this.globalData.showVenueEntry  = !!env.SHOW_VENUE_ENTRY
    } catch(e) {}
  },
  globalData: { token: '', userInfo: null, lang: 'zh', showVideoEntry: false, showRacketEntry: false, showVenueEntry: false }
})

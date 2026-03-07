Component({
  options: { multipleSlots: true },
  properties: {
    title: { type: String, value: '' },
    back: { type: Boolean, value: true },
    background: { type: String, value: '' },
  },
  data: {
    statusBarHeight: 20,
    navHeight: 44,
    totalHeight: 64,
  },
  lifetimes: {
    attached() {
      try {
        const sys = wx.getSystemInfoSync()
        const menu = wx.getMenuButtonBoundingClientRect()
        const statusBarHeight = sys.statusBarHeight || 20
        const navHeight = (menu.top - statusBarHeight) * 2 + menu.height
        const totalHeight = statusBarHeight + navHeight
        this.setData({ statusBarHeight, navHeight, totalHeight })
        // 通知页面 nav-bar 的高度
        this.triggerEvent('height', { height: totalHeight })
      } catch (e) {
        this.setData({ statusBarHeight: 20, navHeight: 44, totalHeight: 64 })
        this.triggerEvent('height', { height: 64 })
      }
    }
  },
  methods: {
    onBack() {
      wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/home/index' }) })
    }
  }
})

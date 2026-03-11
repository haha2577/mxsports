const { applySport, getSportData } = require('../../../utils/sport-config')
const { api, BASE_URL } = require('../../../utils/api')

Page({
  data: {
    ...getSportData("badminton"),
    nickname: '',
    avatar: '',
    saving: false,
    nicknameChanged: false},

  onLoad() {
    applySport(this)
    const user = wx.getStorageSync('userInfo') || {}
    this.setData({ nickname: user.nickname || '', avatar: user.avatar || '' })
  },

  navigateBack() { wx.navigateBack() },

  onNickname(e) {
    this.setData({ nickname: e.detail.value, nicknameChanged: true })
  },

  onNicknameBlur(e) {
    const val = (e.detail.value || '').trim()
    if (val && val !== this.data._origNickname) {
      this.setData({ nickname: val, nicknameChanged: true })
    }
  },

  // 微信原生头像选择（弹出微信头像/相册/拍照）
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    if (!avatarUrl) return
    this.setData({ avatar: avatarUrl })
    this._uploadAvatar(avatarUrl)
  },

  _uploadAvatar(filePath) {
    const token = wx.getStorageSync('token')
    wx.showLoading({ title: '上传中...' })
    wx.uploadFile({
      url: BASE_URL + '/auth/upload-avatar',
      filePath,
      name: 'avatar',
      header: { Authorization: 'Bearer ' + token },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            const url = BASE_URL.replace('/api', '') + data.data.url
            this.setData({ avatar: url })
            // 更新本地缓存 + globalData
            const user = wx.getStorageSync('userInfo') || {}
            user.avatar = url
            wx.setStorageSync('userInfo', user)
            if (getApp().globalData.userInfo) getApp().globalData.userInfo.avatar = url
            wx.showToast({ title: '头像已更新', icon: 'success' })
          } else {
            wx.showToast({ title: data.message || '上传失败', icon: 'none' })
          }
        } catch(e) {
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      },
      fail: () => wx.showToast({ title: '上传失败', icon: 'none' }),
      complete: () => wx.hideLoading()})
  },

  // 保存昵称
  async saveNickname() {
    const { nickname, saving } = this.data
    if (!nickname.trim()) { wx.showToast({ title: '昵称不能为空', icon: 'none' }); return }
    if (saving) return
    this.setData({ saving: true })
    try {
      await api.updateProfile({ nickname: nickname.trim() })
      const user = wx.getStorageSync('userInfo') || {}
      user.nickname = nickname.trim()
      wx.setStorageSync('userInfo', user)
      // 同步到 globalData
      if (getApp().globalData.userInfo) getApp().globalData.userInfo.nickname = nickname.trim()
      this.setData({ nicknameChanged: false })
      wx.showToast({ title: '已保存', icon: 'success' })
    } catch(e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  },

  // 注销账号
  async deleteAccount() {
    const res1 = await wx.showModal({
      title: '注销账号',
      content: '注销后所有数据将无法恢复，确认继续？',
      confirmText: '继续',
      confirmColor: '#e53935'})
    if (!res1.confirm) return
    const res2 = await wx.showModal({
      title: '⚠️ 最终确认',
      content: '账号注销后无法找回，确认注销？',
      confirmText: '确认注销',
      confirmColor: '#e53935'})
    if (!res2.confirm) return
    try {
      await api.deleteAccount()
      // 清除本地登录状态
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
      wx.removeStorageSync('canSwitch')
      if (getApp().globalData) {
        getApp().globalData.token = ''
        getApp().globalData.userInfo = null
      }
      wx.showToast({ title: '账号已注销', icon: 'success' })
      setTimeout(() => wx.reLaunch({ url: '/pages/home/index' }), 1500)
    } catch(e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  }})

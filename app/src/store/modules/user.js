import { defineStore } from 'pinia'
import { storage } from '../../utils/util'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: storage.get('token') || '',
    userInfo: storage.get('userInfo') || null,
    isLogin: !!storage.get('token')
  }),
  getters: {
    nickname: (state) => state.userInfo?.nickname || '未登录',
    avatar: (state) => state.userInfo?.avatar || '/static/images/default-avatar.png'
  },
  actions: {
    initUser() {
      this.token = storage.get('token') || ''
      this.userInfo = storage.get('userInfo') || null
      this.isLogin = !!this.token
    },
    setToken(token) {
      this.token = token
      this.isLogin = true
      storage.set('token', token)
    },
    setUserInfo(info) {
      this.userInfo = info
      storage.set('userInfo', info)
    },
    logout() {
      this.token = ''
      this.userInfo = null
      this.isLogin = false
      storage.remove('token')
      storage.remove('userInfo')
      uni.reLaunch({ url: '/pages/auth/login' })
    }
  }
})

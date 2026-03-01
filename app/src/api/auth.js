import request from '../utils/request'

// 微信登录
export const wxLogin = (code) => request({ url: '/auth/wx-login', method: 'POST', data: { code } })

// 更新用户信息
export const updateUserInfo = (data) => request({ url: '/auth/update-profile', method: 'PUT', data })

// 获取用户信息
export const getUserInfo = () => request({ url: '/auth/profile' })

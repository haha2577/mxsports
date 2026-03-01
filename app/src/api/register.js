import request from '../utils/request'

// 报名参加赛事
export const registerMatch = (matchId, data) =>
  request({ url: `/matches/${matchId}/register`, method: 'POST', data })

// 取消报名
export const cancelRegister = (matchId) =>
  request({ url: `/matches/${matchId}/register`, method: 'DELETE' })

// 获取我的报名列表
export const getMyRegistrations = () => request({ url: '/registrations/mine' })

// 获取赛事报名者列表
export const getRegistrations = (matchId) =>
  request({ url: `/matches/${matchId}/registrations` })

import request from '../utils/request'

// 获取赛事列表
export const getMatchList = (params) => request({ url: '/matches', data: params })

// 获取赛事详情
export const getMatchDetail = (id) => request({ url: `/matches/${id}` })

// 创建赛事
export const createMatch = (data) => request({ url: '/matches', method: 'POST', data })

// 更新比分
export const updateScore = (matchId, gameId, data) =>
  request({ url: `/matches/${matchId}/games/${gameId}/score`, method: 'PUT', data })

// 生成对阵
export const generateDraw = (matchId, type) =>
  request({ url: `/matches/${matchId}/generate-draw`, method: 'POST', data: { type } })

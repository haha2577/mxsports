/**
 * 主题 & 运动切换 — 兼容层
 * 新代码请直接 require('sport-config')
 * 此文件保留向后兼容
 */
const { SPORTS, getSportConfig, applySport, switchSport } = require('./sport-config')

const GRAD_B = SPORTS.badminton.grad
const GRAD_T = SPORTS.tennis.grad

function gradOf(sport) {
  return getSportConfig(sport).grad
}

function readSport(overrideSport) {
  const sportPref = wx.getStorageSync('sportPref') || ''
  const sport = overrideSport || wx.getStorageSync('activeSport') || 'badminton'
  return { sport, sportPref, heroGrad: gradOf(sport) }
}

module.exports = { GRAD_B, GRAD_T, gradOf, readSport, switchSport }

/**
 * 主题 & 运动切换 — 全局共享模块
 * 所有页面统一 require 这里，不再各自定义 GRAD_B / GRAD_T
 */

const GRAD_B = 'linear-gradient(145deg,#0a7a38,#1DB954,#25d366)'   // 羽毛球
const GRAD_T = 'linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'   // 网球

/** 根据运动类型返回渐变色 */
function gradOf(sport) {
  return sport === 'tennis' ? GRAD_T : GRAD_B
}

/** 读取当前运动偏好（从 Storage），返回 { sport, sportPref, heroGrad } */
function readSport(overrideSport) {
  const sportPref = wx.getStorageSync('sportPref') || ''
  const sport = overrideSport || wx.getStorageSync('activeSport') || 'badminton'
  return { sport, sportPref, heroGrad: gradOf(sport) }
}

/**
 * 页面通用的运动切换处理
 * 用法：在 Page methods 中  onSwitchSport(e) { switchSport(this, e, callback) }
 * callback(sport) 可选，切换后重新加载数据
 */
function switchSport(page, e, callback) {
  const sport = typeof e === 'string' ? e : (e.detail || e)
  wx.setStorageSync('activeSport', sport)
  page.setData({ sport, activeSport: sport, heroGrad: gradOf(sport) })
  if (typeof callback === 'function') callback(sport)
}

module.exports = { GRAD_B, GRAD_T, gradOf, readSport, switchSport }

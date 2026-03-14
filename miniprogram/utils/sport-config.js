/**
 * 运动配置中心 — 所有运动相关的视觉 & 文案差异集中在此
 *
 * 用法：
 *   const { getSportConfig } = require('../../utils/sport-config')
 *   const cfg = getSportConfig('badminton')
 *   // cfg.emoji  → '🏸'
 *   // cfg.grad   → 'linear-gradient(145deg,...)'
 *   // cfg.label  → '羽毛球'
 *   // cfg.cardBg → '#e8f7ee'
 */

const SPORTS = {
  badminton: {
    key: 'badminton',
    emoji: '🏸',
    label: '羽毛球',
    // 渐变色
    grad: 'linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',
    // 纯色（用于小元素）
    primary: '#1DB954',
    primaryDark: '#0a7a38',
    primaryLight: '#25d366',
    // 功能卡片 icon 背景
    cardBg: '#d0f0dc',
    // 列表项 icon 背景
    listIconBg: '#e8f7ee',
    // 运动 tag 样式
    tagClass: 'tag-b',
    // 文案
    heroSub: '报名、组织、记录你的每一场比赛',
    emptyText: '附近暂无比赛',
    sportTag: '羽毛球',
    // 功能开关（以后按需扩展）
    features: {
      racketRecommend: true,
      videoAnalysis: true,
    },
  },
  tennis: {
    key: 'tennis',
    emoji: '🎾',
    label: '网球',
    grad: 'linear-gradient(145deg,#8a3010,#d4541f,#e8712a)',
    primary: '#d4541f',
    primaryDark: '#8a3010',
    primaryLight: '#e8712a',
    cardBg: '#fde3d0',
    listIconBg: '#fdf0e8',
    tagClass: 'tag-t',
    heroSub: '专业赛事管理，积分排名实时更新',
    emptyText: '附近暂无比赛',
    sportTag: '网球',
    features: {
      racketRecommend: true,
      videoAnalysis: true,
    },
  },
}

/** 获取运动配置，默认 badminton */
function getSportConfig(sport) {
  return SPORTS[sport] || SPORTS.badminton
}

/** 从 Storage 读取当前运动并返回配置 */
function getCurrentSportConfig(overrideSport) {
  const sport = overrideSport || wx.getStorageSync('activeSport') || 'badminton'
  return getSportConfig(sport)
}

/** 获取当前运动的 data 对象（方便 setData 合并） */
function getSportData(sport) {
  const cfg = getSportConfig(sport)
  return {
    sport: cfg.key,
    activeSport: cfg.key,
    heroGrad: cfg.grad,
    sportEmoji: cfg.emoji,
    sportLabel: cfg.label,
    sportPrimary: cfg.primary,
    sportCardBg: cfg.cardBg,
    sportListIconBg: cfg.listIconBg,
    sportHeroSub: cfg.heroSub,
    sportTag: cfg.sportTag,
  }
}

/**
 * 页面通用：切换运动 + setData + 可选回调
 * 用法：onSwitchSport(e) { switchSport(this, e, (sport) => this._load(sport)) }
 */
function switchSport(page, e, callback) {
  const sport = typeof e === 'string' ? e : (e.detail || e)
  wx.setStorageSync('activeSport', sport)
  page.setData(getSportData(sport))
  if (typeof callback === 'function') callback(sport)
}

/**
 * 页面 onShow / onLoad 通用：读取运动并 setData
 * 返回 sport key
 */
function applySport(page, overrideSport) {
  const sport = overrideSport || wx.getStorageSync('activeSport') || 'badminton'
  page.setData(getSportData(sport))
  return sport
}

module.exports = {
  SPORTS,
  getSportConfig,
  getCurrentSportConfig,
  getSportData,
  switchSport,
  applySport,
}

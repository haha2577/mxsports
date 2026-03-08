/**
 * 格式化时间字符串
 * 输入：ISO 8601 字符串，如 "2026-03-14T04:04:42.149575+08:00"
 * 输出：如 "3月14日 12:04"
 */
function fmtTime(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return ''
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hh}:${mm}`
}

/**
 * 只显示日期，不含时间
 * 输出：如 "3月14日（周六）"
 */
function fmtDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return ''
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日（${weeks[d.getDay()]}）`
}

module.exports = { fmtTime, fmtDate }

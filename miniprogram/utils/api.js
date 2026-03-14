const BASE_URL = (function() {
  try {
    const env = require('./env.js')
    if (env.API_BASE) {
      console.log('[API] 使用本地:', env.API_BASE)
      return env.API_BASE
    }
  } catch (e) {}
  console.log('[API] 使用生产:', 'https://mxsports.vip/api')
  return 'https://mxsports.vip/api'
})()

function request(method, url, data) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      },
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res)
        else reject(res)
      },
      fail: reject
    })
  })
}

const api = {
  sendSms:        (data) => request('POST', '/auth/send-sms', data),
  phoneLogin:     (data) => request('POST', '/auth/phone-login', data),
  wxLogin:        (data) => request('POST', '/auth/wx-login', data),
  getProfile:     ()     => request('GET',  '/auth/profile'),
  updateProfile:  (data) => request('PUT',  '/auth/update-profile', data),
  matches:        (qs)   => request('GET',  '/matches' + (qs||'')),
  myMatches:      (qs)   => request('GET',  '/matches/mine' + (qs||'')),
  myRegs:         (qs)   => request('GET',  '/registrations/mine' + (qs||'')),
  matchDetail:    (id)   => request('GET',  '/matches/' + id),
  createMatch:    (data) => request('POST', '/matches', data),
  register:       (id)   => request('POST',   '/matches/' + id + '/register', {}),
  cancelRegister: (id)   => request('DELETE', '/matches/' + id + '/register', {}),
  previewDraw:    (id, type)   => request('POST', '/matches/' + id + '/generate-draw', { type, preview: true }),
  confirmDraw:    (id, type, games) => request('POST', '/matches/' + id + '/generate-draw', { type, preview: false, games }),
  matchGames:     (id)         => request('GET',    '/matches/' + id + '/games'),
  updateScore:    (id, gid, s1, s2) => request('PUT', `/matches/${id}/games/${gid}/score`, { score1: s1, score2: s2 }),
  leaderboard:    (id)         => request('GET',    '/matches/' + id + '/leaderboard'),
  finishMatch:    (id)         => request('POST',   '/matches/' + id + '/finish', {}),
  matchAction:    (id, action) => request('POST',   '/matches/' + id + '/status', { action }),
  deleteMatch:    (id)         => request('DELETE', '/matches/' + id + '/status', {}),
  adminCancelReg: (matchId, regId) => request('DELETE', `/matches/${matchId}/registrations/${regId}`, {}),
  updateActiveSport: (sport) => request('PUT', '/auth/update-profile', { activeSport: sport }),
  friends:        ()     => request('GET', '/users/friends'),
  deleteAccount:  ()     => request('DELETE', '/auth/delete-account', {}),
  venues:         (qs)   => request('GET', '/venues' + (qs||'')),
  news:           (qs)   => request('GET', '/news' + (qs||'')),
  newsDetail:     (id)   => request('GET', '/news/' + id),
  venueDetail:    (id)   => request('GET', '/venues/' + id),
}

/**
 * AI 流式对话
 * @param {Array} messages - [{role, content}]
 * @param {Function} onChunk - 每次收到内容片段的回调 (content: string)
 * @param {Function} onDone - 流结束回调
 * @param {Function} onError - 错误回调 (errMsg: string)
 * @returns {RequestTask} 可调用 .abort() 取消
 */
function aiChat(messages, onChunk, onDone, onError) {
  let buffer = ''
  const task = wx.request({
    url: BASE_URL + '/ai/chat',
    method: 'POST',
    data: JSON.stringify({ messages }),
    header: { 'Content-Type': 'application/json' },
    enableChunkedTransfer: true,
    responseType: 'text',
    success: () => { if (onDone) onDone() },
    fail: (err) => { if (onError) onError(err.errMsg || '网络错误') },
  })

  task.onChunkReceived && task.onChunkReceived(function(res) {
    try {
      const text = typeof res.data === 'string'
        ? res.data
        : String.fromCharCode.apply(null, new Uint8Array(res.data))
      buffer += text
      // Parse SSE lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.slice(6).trim()
        if (!jsonStr) continue
        try {
          const obj = JSON.parse(jsonStr)
          if (obj.error) {
            if (onError) onError(obj.error)
            return
          }
          if (obj.content && onChunk) onChunk(obj.content)
          if (obj.done && onDone) onDone()
        } catch (e) {}
      }
    } catch (e) {}
  })

  return task
}

module.exports = { api, request, BASE_URL, aiChat }

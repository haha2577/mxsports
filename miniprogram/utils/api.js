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
  console.log('[API]', method, BASE_URL + url, data || '')
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
  wxPhoneLogin:   (data) => request('POST', '/auth/wx-phone-login', data),
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
  bindPhone:      (data) => request('POST', '/auth/bind-phone', data),
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
  let finished = false

  function finish() {
    if (finished) return
    finished = true
    if (onDone) onDone()
  }

  function fail(msg) {
    if (finished) return
    finished = true
    if (onError) onError(msg)
  }

  // UTF-8 ArrayBuffer → String 解码器
  function decodeUTF8(ab) {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(ab)
    }
    // 手动解码 UTF-8
    var bytes = new Uint8Array(ab)
    var out = ''
    var i = 0
    while (i < bytes.length) {
      var b = bytes[i]
      if (b < 0x80) {
        out += String.fromCharCode(b); i++
      } else if (b < 0xe0) {
        out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i+1] & 0x3f)); i += 2
      } else if (b < 0xf0) {
        out += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i+1] & 0x3f) << 6) | (bytes[i+2] & 0x3f)); i += 3
      } else {
        var cp = ((b & 0x07) << 18) | ((bytes[i+1] & 0x3f) << 12) | ((bytes[i+2] & 0x3f) << 6) | (bytes[i+3] & 0x3f)
        // surrogate pair
        cp -= 0x10000
        out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff)); i += 4
      }
    }
    return out
  }

  console.log('[AI] === 发起请求 ===, messages:', messages.length, 'url:', BASE_URL + '/ai/chat')

  const task = wx.request({
    url: BASE_URL + '/ai/chat',
    method: 'POST',
    data: JSON.stringify({ messages }),
    header: { 'Content-Type': 'application/json' },
    enableChunked: true,
    responseType: 'arraybuffer',
    success: function(res) {
      console.log('[AI] === success 回调 ===, statusCode:', res.statusCode, 'dataType:', typeof res.data, 'chunkReceived:', chunkReceived)
      console.log('[AI] response data 类型:', Object.prototype.toString.call(res.data), 'byteLength:', res.data && res.data.byteLength)
      // 如果 onChunkReceived 没触发过，尝试从 success 里解析完整响应
      if (!chunkReceived && res.data) {
        console.log('[AI] onChunkReceived 未触发，从 success 回调解析')
        var fullText = typeof res.data === 'string' ? res.data : ''
        var sseLines = fullText.split('\n')
        for (var j = 0; j < sseLines.length; j++) {
          var sl = sseLines[j]
          if (sl.indexOf('data: ') !== 0) continue
          var js = sl.slice(6).trim()
          if (!js) continue
          try {
            var o = JSON.parse(js)
            if (o.content && onChunk) onChunk(o.content)
          } catch(e) {}
        }
      }
      finish()
    },
    fail: function(err) {
      console.log('[AI] request fail:', JSON.stringify(err))
      fail(err.errMsg || '网络错误')
    },
  })

  var chunkReceived = false
  var chunkCount = 0
  console.log('[AI] === task 创建完毕 ===, onChunkReceived 可用:', !!task.onChunkReceived, 'onHeadersReceived 可用:', !!task.onHeadersReceived)

  if (task.onHeadersReceived) {
    task.onHeadersReceived(function(res) {
      console.log('[AI] === onHeadersReceived ===, headers:', JSON.stringify(res.header || res.headers || {}).slice(0, 300))
    })
  }

  if (task.onChunkReceived) {
    task.onChunkReceived(function(res) {
      chunkCount++
      chunkReceived = true
      try {
        var text = typeof res.data === 'string' ? res.data : decodeUTF8(res.data)
        console.log('[AI] === chunk #' + chunkCount + ' ===, 数据类型:', Object.prototype.toString.call(res.data), '长度:', text.length, '内容(前200):', text.slice(0, 200))
        buffer += text
        var lines = buffer.split('\n')
        buffer = lines.pop() || ''
        console.log('[AI] chunk #' + chunkCount + ' 拆分行数:', lines.length, '剩余buffer长度:', buffer.length)
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i]
          if (!line.trim()) continue
          if (line.indexOf('data: ') !== 0) {
            console.log('[AI] 跳过非data行:', line.slice(0, 100))
            continue
          }
          var jsonStr = line.slice(6).trim()
          if (!jsonStr) continue
          try {
            var obj = JSON.parse(jsonStr)
            console.log('[AI] SSE解析成功: content长度=', (obj.content || '').length, 'done=', obj.done, 'error=', obj.error)
            if (obj.error) { fail(obj.error); return }
            if (obj.content && onChunk) {
              console.log('[AI] >>> 调用 onChunk, 内容:', obj.content.slice(0, 50))
              onChunk(obj.content)
            }
            if (obj.done) finish()
          } catch (e) {
            console.log('[AI] JSON解析失败:', jsonStr.slice(0, 100), e.message)
          }
        }
      } catch (e) {
        console.log('[AI] chunk处理异常:', e.message)
      }
    })
  }

  return task
}

/**
 * 将相对路径补全为完整 URL（头像等媒体资源）
 * 已经是 http(s) 的直接返回，否则拼接 API_BASE 的域名
 */
function resolveUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // BASE_URL 形如 https://mxsports.vip/api，取域名部分
  const origin = BASE_URL.replace(/\/api\/?$/, '')
  const sep = path.startsWith('/') ? '' : '/'
  return origin + sep + path
}

module.exports = { api, request, BASE_URL, aiChat, resolveUrl }

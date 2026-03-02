const BASE = '/api'
const api = {
  _token: () => localStorage.getItem('mx_token') || '',
  _headers() {
    const h = { 'Content-Type': 'application/json' }
    if (this._token()) h['Authorization'] = 'Bearer ' + this._token()
    return h
  },
  async req(method, url, data) {
    const opts = { method, headers: this._headers() }
    if (data) opts.body = JSON.stringify(data)
    const res = await fetch(BASE + url, opts)
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || json.detail || res.statusText)
    return json
  },
  get:  (u)    => api.req('GET', u),
  post: (u, d) => api.req('POST', u, d),
  put:  (u, d) => api.req('PUT', u, d),
  del:  (u)    => api.req('DELETE', u),
  sendSms:     (phone)       => api.post('/auth/send-sms', { phone }),
  phoneLogin:  (phone, code) => api.post('/auth/phone-login', { phone, code }),
  profile:     ()            => api.get('/auth/profile'),
  updateProfile:(d)          => api.put('/auth/update-profile', d),
  matches:     (q='')        => api.get('/matches' + q),
  matchDetail: (id)          => api.get(`/matches/${id}`),
  createMatch: (d)           => api.post('/matches', d),
  register:    (id, d)       => api.post(`/matches/${id}/register`, d),
  myRegs:      ()            => api.get('/registrations/mine'),
}
window.api = api

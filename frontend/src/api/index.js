const BASE_URL = 'https://mxsports.vip/api'

function getToken() { return uni.getStorageSync('token') || '' }

export function request(method, url, data) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url, method, data,
      header: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      success: res => {
        if (res.statusCode === 401) { uni.removeStorageSync('token'); uni.removeStorageSync('userInfo') }
        if (res.statusCode >= 400) reject(new Error(res.data?.message || `Error ${res.statusCode}`))
        else resolve(res.data)
      },
      fail: err => reject(new Error(err.errMsg || '连接失败'))
    })
  })
}

export const api = {
  get:  (url)       => request('GET', url),
  post: (url, data) => request('POST', url, data),
  put:  (url, data) => request('PUT', url, data),
  sendSms:       phone        => request('POST', '/auth/send-sms', { phone }),
  phoneLogin:    (phone, code)=> request('POST', '/auth/phone-login', { phone, code }),
  wxLogin:       d            => request('POST', '/auth/wx-login', d),
  wxPhoneLogin:  d            => request('POST', '/auth/wx-phone-login', d),
  getProfile:    ()           => request('GET',  '/auth/profile'),
  updateProfile: d            => request('PUT',  '/auth/update-profile', d),
  matches:    (q='')          => request('GET',  '/matches' + q),
  matchById:  id              => request('GET',  `/matches/${id}`),
  createMatch:d               => request('POST', '/matches', d),
  register:   id              => request('POST', `/matches/${id}/register`, {}),
  myRegs:     ()              => request('GET',  '/registrations/mine'),
}

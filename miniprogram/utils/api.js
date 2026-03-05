const BASE_URL = 'https://mxsports.vip/api'

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
  sendSms:      (data) => request('POST', '/auth/send-sms/', data),
  phoneLogin:   (data) => request('POST', '/auth/phone-login/', data),
  wxLogin:      (data) => request('POST', '/auth/wx-login/', data),
  getProfile:   ()     => request('GET',  '/users/me/'),
  updateProfile:(data) => request('PATCH','/users/me/', data),
  matches:      (qs)   => request('GET',  '/matches/' + (qs||'')),
  createMatch:  (data) => request('POST', '/matches/', data),
}

module.exports = { api, request }

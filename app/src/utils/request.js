import { useUserStore } from '../store/modules/user'

const BASE_URL = 'https://mxsports.vip/api'
const TIMEOUT  = 10000 // 10s

let loadingCount = 0

const showLoading = () => {
  if (loadingCount === 0) {
    uni.showNavigationBarLoading()
  }
  loadingCount++
}
const hideLoading = () => {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount === 0) {
    uni.hideNavigationBarLoading()
  }
}

/**
 * 统一请求封装
 * @param {object} options - { url, method, data, silent, retries }
 */
const request = (options, _retryCount = 0) => {
  const { url, method = 'GET', data = {}, silent = false, retries = 1 } = options

  return new Promise((resolve, reject) => {
    const userStore = useUserStore()
    if (!silent) showLoading()

    const timer = setTimeout(() => {
      hideLoading()
      if (!silent) uni.showToast({ title: '请求超时，请检查网络', icon: 'none' })
      reject(new Error('TIMEOUT'))
    }, TIMEOUT)

    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': userStore.token ? `Bearer ${userStore.token}` : ''
      },
      success: (res) => {
        clearTimeout(timer)
        hideLoading()

        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else if (res.data.code === 401) {
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
            setTimeout(() => userStore.logout(), 1500)
            reject(res.data)
          } else {
            if (!silent) uni.showToast({ title: res.data.message || '操作失败', icon: 'none' })
            reject(res.data)
          }
        } else if (res.statusCode >= 500 && _retryCount < retries) {
          // 服务端错误自动重试
          console.warn(`[request] 服务器错误 ${res.statusCode}，第 ${_retryCount + 1} 次重试`)
          setTimeout(() => request(options, _retryCount + 1).then(resolve).catch(reject), 1000)
        } else {
          if (!silent) uni.showToast({ title: `网络错误 ${res.statusCode}`, icon: 'none' })
          reject(res)
        }
      },
      fail: (err) => {
        clearTimeout(timer)
        hideLoading()
        if (_retryCount < retries) {
          console.warn(`[request] 请求失败，第 ${_retryCount + 1} 次重试`)
          setTimeout(() => request(options, _retryCount + 1).then(resolve).catch(reject), 1000)
        } else {
          if (!silent) uni.showToast({ title: '网络连接失败', icon: 'none' })
          reject(err)
        }
      }
    })
  })
}

export default request

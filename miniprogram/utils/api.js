const auth = require('./auth.js')

const BASE_URL = 'https://maxlulu-ai-iota.vercel.app'

let redirectingToLogin = false

function request(path, { method = 'GET', data, header = {}, timeout = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    const token = auth.getToken()
    const headers = Object.assign(
      {
        'Content-Type': 'application/json',
      },
      token ? { Authorization: 'Bearer ' + token } : {},
      header
    )

    wx.request({
      url: BASE_URL + path,
      method,
      data,
      header: headers,
      timeout,
      success(res) {
        if (res.statusCode === 401) {
          auth.clear()
          if (!redirectingToLogin) {
            redirectingToLogin = true
            wx.reLaunch({
              url: '/pages/login/login',
              complete() {
                redirectingToLogin = false
              },
            })
          }
          reject(new Error('Unauthorized'))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        const msg = (res.data && res.data.error) || ('HTTP ' + res.statusCode)
        reject(new Error(msg))
      },
      fail(err) {
        reject(new Error((err && err.errMsg) || '网络请求失败'))
      },
    })
  })
}

module.exports = {
  BASE_URL,
  request,
  get: (path, opts) => request(path, Object.assign({}, opts, { method: 'GET' })),
  post: (path, data, opts) =>
    request(path, Object.assign({}, opts, { method: 'POST', data })),
  patch: (path, data, opts) =>
    request(path, Object.assign({}, opts, { method: 'PATCH', data })),
}

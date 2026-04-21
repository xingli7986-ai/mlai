const TOKEN_KEY = 'maxlulu_token'
const USER_KEY = 'maxlulu_user'

function getToken() {
  try {
    return wx.getStorageSync(TOKEN_KEY) || ''
  } catch (_) {
    return ''
  }
}

function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token || '')
}

function getUser() {
  try {
    return wx.getStorageSync(USER_KEY) || null
  } catch (_) {
    return null
  }
}

function setUser(user) {
  wx.setStorageSync(USER_KEY, user || null)
}

function clear() {
  wx.removeStorageSync(TOKEN_KEY)
  wx.removeStorageSync(USER_KEY)
}

function isLoggedIn() {
  return !!getToken()
}

module.exports = {
  getToken,
  setToken,
  getUser,
  setUser,
  clear,
  isLoggedIn,
}

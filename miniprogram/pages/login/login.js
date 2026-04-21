const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')

const PHONE_REGEX = /^1[3-9]\d{9}$/

Page({
  data: {
    step: 'phone',
    phone: '',
    code: '',
    validPhone: false,
    error: '',
    loading: false,
  },

  onPhoneInput(e) {
    const phone = (e.detail.value || '').replace(/\D/g, '').slice(0, 11)
    this.setData({
      phone,
      validPhone: PHONE_REGEX.test(phone),
      error: '',
    })
  },

  onCodeInput(e) {
    const code = (e.detail.value || '').replace(/\D/g, '').slice(0, 4)
    this.setData({ code, error: '' })
  },

  handleNext() {
    if (!this.data.validPhone) {
      this.setData({ error: '请输入有效的 11 位手机号' })
      return
    }
    this.setData({ step: 'code', code: '', error: '' })
  },

  handleBack() {
    this.setData({ step: 'phone', code: '', error: '' })
  },

  handleLogin() {
    if (this.data.code.length !== 4) {
      this.setData({ error: '请输入 4 位验证码' })
      return
    }
    this.setData({ loading: true, error: '' })
    api
      .post('/api/miniapp/login', {
        phone: this.data.phone,
        code: this.data.code,
      })
      .then((res) => {
        if (!res || !res.success || !res.token) {
          throw new Error((res && res.error) || '登录失败')
        }
        auth.setToken(res.token)
        auth.setUser(res.user)
        const app = getApp()
        if (app) app.globalData.user = res.user
        wx.showToast({ title: '登录成功', icon: 'success', duration: 1200 })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/my/my' })
        }, 600)
      })
      .catch((err) => {
        this.setData({
          loading: false,
          error: (err && err.message) || '验证码错误，请输入 1234',
        })
      })
  },
})

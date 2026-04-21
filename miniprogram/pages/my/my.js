const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')

const SKIRT_LABEL = {
  'a-line': 'A 字裙',
  straight: '直筒裙',
  half: '半身裙',
  pleated: '百褶裙',
  flared: '鱼尾裙',
  wrap: '一片式裹裙',
}

const FABRIC_LABEL = { cotton: '棉麻', silk: '真丝' }

const STATUS_META = {
  pending: { text: '待付款', cls: 'badge-amber' },
  paid: { text: '待发货', cls: 'badge-sky' },
  shipped: { text: '已发货', cls: 'badge-indigo' },
  completed: { text: '已完成', cls: 'badge-emerald' },
  cancelled: { text: '已取消', cls: 'badge-gray' },
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function enrichOrder(o) {
  const meta = STATUS_META[o.status] || { text: o.status, cls: 'badge-gray' }
  return Object.assign({}, o, {
    _skirtName: SKIRT_LABEL[o.skirtType] || o.skirtType,
    _fabricName: FABRIC_LABEL[o.fabric] || o.fabric,
    _statusText: meta.text,
    _badgeClass: meta.cls,
    _date: formatDate(o.createdAt),
  })
}

function enrichDesign(d) {
  const prompt = d.prompt || ''
  return Object.assign({}, d, {
    _excerpt: prompt.length > 14 ? prompt.slice(0, 14) + '...' : prompt,
  })
}

Page({
  data: {
    isLoggedIn: false,
    maskedPhone: '',
    phoneTail: 'ML',
    stats: { pending: 0, paid: 0, completed: 0 },
    designs: [],
    designsLoading: true,
    recentOrders: [],
    ordersLoading: true,
    toast: '',
  },

  onShow() {
    const loggedIn = auth.isLoggedIn()
    const user = auth.getUser()
    if (!loggedIn || !user) {
      this.setData({ isLoggedIn: false })
      return
    }
    const phone = (user.phone || '').toString()
    const masked = phone.length === 11 ? `${phone.slice(0, 3)} **** ${phone.slice(7)}` : phone
    const tail = phone.slice(-2) || 'ML'
    this.setData({
      isLoggedIn: true,
      maskedPhone: masked,
      phoneTail: tail,
    })
    this.loadAll()
  },

  onPullDownRefresh() {
    this.loadAll().then(() => wx.stopPullDownRefresh())
  },

  loadAll() {
    return Promise.all([this.fetchDesigns(), this.fetchOrders()])
  },

  fetchDesigns() {
    this.setData({ designsLoading: true })
    return api
      .get('/api/designs/list')
      .then((res) => {
        const list = (res && res.designs) || []
        this.setData({
          designs: list.slice(0, 6).map(enrichDesign),
          designsLoading: false,
        })
      })
      .catch(() => {
        this.setData({ designs: [], designsLoading: false })
      })
  },

  fetchOrders() {
    this.setData({ ordersLoading: true })
    return api
      .get('/api/orders/list')
      .then((res) => {
        const list = (res && res.orders) || []
        const stats = {
          pending: list.filter((o) => o.status === 'pending').length,
          paid: list.filter((o) => o.status === 'paid').length,
          completed: list.filter((o) => o.status === 'completed').length,
        }
        this.setData({
          stats,
          recentOrders: list.slice(0, 3).map(enrichOrder),
          ordersLoading: false,
        })
      })
      .catch(() => {
        this.setData({
          stats: { pending: 0, paid: 0, completed: 0 },
          recentOrders: [],
          ordersLoading: false,
        })
      })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  goDesign() {
    wx.switchTab({ url: '/pages/design/design' })
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (!res.confirm) return
        auth.clear()
        const app = getApp()
        if (app) app.globalData.user = null
        this.setData({ isLoggedIn: false })
        wx.showToast({ title: '已退出', icon: 'success', duration: 1000 })
      },
    })
  },
})

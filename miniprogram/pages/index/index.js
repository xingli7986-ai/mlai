const auth = require('../../utils/auth.js')

Page({
  data: {
    isLoggedIn: false,
    steps: [
      { t: '描述想法', d: '用一句话说出你想要的印花' },
      { t: 'AI 生成', d: '数秒内获得多款设计方案' },
      { t: '定制上身', d: '选择裙型面料，直接下单' },
    ],
    showcase: [
      {
        user: 'lulu_chan',
        tag: '花卉',
        desc: '午后樱花与薄雾，粉调渐变',
        gradient: '135deg, #FF6B9D 0%, #C084FC 100%',
      },
      {
        user: 'mochi.design',
        tag: '水彩',
        desc: '抽象水墨山水，留白呼吸',
        gradient: '135deg, #6BC5FF 0%, #C084FC 100%',
      },
      {
        user: 'velvet_rose',
        tag: '复古',
        desc: '复古邮票拼贴风，琥珀调',
        gradient: '135deg, #FFB86B 0%, #FF6B9D 100%',
      },
      {
        user: 'xiaoxi',
        tag: '热带',
        desc: '夏日热带雨林，大叶植物剪影',
        gradient: '135deg, #6BE3A7 0%, #6BC5FF 100%',
      },
      {
        user: 'starry_petals',
        tag: '波普',
        desc: '波普漫画闪电，撞色黄黑',
        gradient: '135deg, #FFE56B 0%, #FF6B9D 100%',
      },
      {
        user: 'indigo_bloom',
        tag: '极简',
        desc: '极简线条，黑白灰调',
        gradient: '135deg, #A78BFA 0%, #374151 100%',
      },
    ],
  },

  onShow() {
    this.setData({ isLoggedIn: auth.isLoggedIn() })
  },

  goDesign() {
    wx.switchTab({ url: '/pages/design/design' })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },
})

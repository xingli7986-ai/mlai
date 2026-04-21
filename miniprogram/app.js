const auth = require('./utils/auth.js')

App({
  globalData: {
    user: null,
  },
  onLaunch() {
    const token = auth.getToken()
    if (token) {
      const user = auth.getUser()
      this.globalData.user = user
    }
  },
})

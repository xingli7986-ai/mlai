const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')

const BASE_PRICE = 299
const SILK_SURCHARGE = 100

Page({
  data: {
    presets: [
      { label: '花卉', text: '盛开的花朵印花，花瓣飘落' },
      { label: '几何', text: '现代几何图形，线条交错' },
      { label: '水彩', text: '水彩晕染效果，色彩渐变流动' },
      { label: '波普', text: '波普艺术风格，大胆撞色' },
      { label: '民族风', text: '民族风图腾纹样，异域风情' },
      { label: '极简', text: '极简线条，黑白灰调' },
    ],
    skirts: [
      { id: 'a-line', name: 'A 字裙', desc: '经典显瘦' },
      { id: 'straight', name: '直筒裙', desc: '利落简约' },
      { id: 'half', name: '半身裙', desc: '灵动百搭' },
      { id: 'pleated', name: '百褶裙', desc: '飘逸复古' },
      { id: 'flared', name: '鱼尾裙', desc: '收腰展摆' },
      { id: 'wrap', name: '一片式裹裙', desc: '优雅随性' },
    ],
    fabrics: [
      { id: 'cotton', name: '棉麻', desc: '亲肤透气' },
      { id: 'silk', name: '真丝', desc: '顺滑高级（+¥100）' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    basePrice: BASE_PRICE,

    prompt: '',
    images: [],
    selectedImage: null,
    skirtType: null,
    fabric: null,
    size: null,
    price: BASE_PRICE,

    generating: false,
    genError: '',
    saving: false,
    savedDesignId: '',
    saveError: '',
    submitting: false,
    submitError: '',
    toast: '',
  },

  onShow() {
    if (!auth.isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
    }
  },

  onPromptInput(e) {
    this.setData({ prompt: e.detail.value || '' })
  },

  applyPreset(e) {
    this.setData({ prompt: e.currentTarget.dataset.text })
  },

  showToast(message) {
    this.setData({ toast: message })
    if (this._toastTimer) clearTimeout(this._toastTimer)
    this._toastTimer = setTimeout(() => this.setData({ toast: '' }), 2400)
  },

  handleGenerate() {
    const prompt = (this.data.prompt || '').trim()
    if (!prompt || this.data.generating) return
    this.setData({ generating: true, genError: '' })
    api
      .post('/api/generate', { prompt })
      .then((res) => {
        if (!res || !Array.isArray(res.images) || res.images.length === 0) {
          throw new Error('生成结果为空，请重试')
        }
        this.setData({
          images: res.images,
          selectedImage: null,
          savedDesignId: '',
          saveError: '',
          skirtType: null,
          fabric: null,
          size: null,
          price: BASE_PRICE,
        })
      })
      .catch((err) => {
        this.setData({ genError: (err && err.message) || '生成失败，请稍后再试' })
      })
      .finally(() => {
        this.setData({ generating: false })
      })
  },

  handleRegenerate() {
    this.setData({
      images: [],
      selectedImage: null,
      savedDesignId: '',
      saveError: '',
      skirtType: null,
      fabric: null,
      size: null,
    })
  },

  handlePickImage(e) {
    const i = Number(e.currentTarget.dataset.index)
    this.setData({
      selectedImage: i,
      savedDesignId: '',
      saveError: '',
    })
  },

  handleSaveDesign() {
    if (this.data.saving || this.data.selectedImage === null) return
    const url = this.data.images[this.data.selectedImage]
    if (!url) return
    this.setData({ saving: true, saveError: '' })
    api
      .post('/api/designs/save', {
        prompt: (this.data.prompt || '').trim(),
        selectedImage: url,
        images: this.data.images,
      })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error((res && res.error) || '保存失败')
        }
        this.setData({ savedDesignId: res.designId || 'saved' })
        this.showToast('设计已保存 ✨')
      })
      .catch((err) => {
        this.setData({ saveError: (err && err.message) || '保存失败' })
      })
      .finally(() => {
        this.setData({ saving: false })
      })
  },

  pickSkirt(e) {
    this.setData({ skirtType: e.currentTarget.dataset.id })
  },

  pickFabric(e) {
    const fabric = e.currentTarget.dataset.id
    const price = fabric === 'silk' ? BASE_PRICE + SILK_SURCHARGE : BASE_PRICE
    this.setData({ fabric, price })
  },

  pickSize(e) {
    this.setData({ size: e.currentTarget.dataset.size })
  },

  handleSubmit() {
    const d = this.data
    if (
      d.submitting ||
      d.selectedImage === null ||
      !d.skirtType ||
      !d.fabric ||
      !d.size ||
      !d.prompt.trim()
    )
      return
    const url = d.images[d.selectedImage]
    if (!url) {
      this.setData({ submitError: '选中方案丢失，请重新选择' })
      return
    }
    this.setData({ submitting: true, submitError: '' })
    api
      .post('/api/orders', {
        prompt: d.prompt.trim(),
        selectedImage: url,
        skirtType: d.skirtType,
        fabric: d.fabric,
        size: d.size,
      })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error((res && res.error) || '下单失败')
        }
        this.showToast('下单成功 🎉')
        setTimeout(() => {
          wx.switchTab({ url: '/pages/my/my' })
        }, 900)
      })
      .catch((err) => {
        this.setData({
          submitError: (err && err.message) || '下单失败，请稍后再试',
          submitting: false,
        })
      })
  },
})

const ICONS = require('./icons')

Component({
  properties: {
    name:  { type: String, value: '' },
    size:  { type: Number, value: 40 },    // rpx
    color: { type: String, value: '#888888' },
  },
  data: { src: '' },
  observers: {
    'name, color': function(name, color) {
      const path = ICONS[name]
      if (!path) { this.setData({ src: '' }); return }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`
      this.setData({ src: `data:image/svg+xml,${encodeURIComponent(svg)}` })
    },
  },
})

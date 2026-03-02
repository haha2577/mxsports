<script>
import { getLang } from './locales/index.js'
export default {
  onLaunch() {
    const token = uni.getStorageSync('token')
    const user  = uni.getStorageSync('userInfo')
    if (token) getApp().globalData.token = token
    if (user)  getApp().globalData.userInfo = user
    getApp().globalData.lang = getLang()
  },
  globalData: { token: '', userInfo: null, lang: 'zh' }
}
</script>
<style lang="scss">@import './uni.scss';</style>

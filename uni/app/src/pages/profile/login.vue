<template>
  <view class="page">
    <view class="hero">
      <text class="hero-emoji">👤</text>
      <text class="hero-title">{{ t.auth.login }}</text>
      <text class="hero-sub">{{ t.auth.autoCreate }}</text>
    </view>
    <view class="form">
      <!-- 微信手机号（仅小程序） -->
      <view v-if="isMP" class="wx-btn-wrap">
        <button open-type="getPhoneNumber" @getphonenumber="onWxPhone" class="wx-btn">{{ t.auth.wxLogin }}</button>
        <text class="divider">—— 或 ——</text>
      </view>
      <!-- 手机号 + 验证码 -->
      <input class="inp" type="number" v-model="phone" :placeholder="t.auth.phone" maxlength="11" />
      <view class="code-row">
        <input class="inp code-inp" type="number" v-model="code" :placeholder="t.auth.code" maxlength="6" />
        <button class="send-btn" :disabled="countdown>0||sending" @tap="sendCode">{{ countdown>0?`${countdown}s`:t.auth.sendCode }}</button>
      </view>
      <button class="login-btn" :disabled="loading" @tap="doLogin">{{ loading?'登录中...':t.auth.loginBtn }}</button>
      <text class="tip">{{ t.auth.phoneTip }}</text>
    </view>
  </view>
</template>
<script>
import { t } from '../../locales/index.js'
import { api } from '../../api/index.js'
export default {
  data() { return { t:t(), phone:'', code:'', countdown:0, sending:false, loading:false } },
  computed: { isMP() { return typeof wx!=='undefined' } },
  methods: {
    async sendCode() {
      if (!/^1[3-9]\d{9}$/.test(this.phone)) { uni.showToast({title:'请输入正确手机号',icon:'none'}); return }
      this.sending=true
      try {
        await api.sendSms(this.phone)
        uni.showToast({ title:'验证码已发送', icon:'none' })
        this.countdown=60; this._tick()
      } catch(e) { uni.showModal({ title:'发送失败', content:e.message }) }
      this.sending=false
    },
    _tick() { const t=setInterval(()=>{ if(this.countdown<=0){clearInterval(t);return}; this.countdown-- }, 1000) },
    async doLogin() {
      if (!this.phone||!this.code) { uni.showToast({title:'请填写手机号和验证码',icon:'none'}); return }
      this.loading=true
      try {
        const r=await api.phoneLogin(this.phone, this.code)
        if (r.data?.token) {
          uni.setStorageSync('token', r.data.token)
          getApp().globalData.token=r.data.token
          const p=await api.getProfile()
          if (p.data) { uni.setStorageSync('userInfo', p.data); getApp().globalData.userInfo=p.data }
          uni.showToast({ title:this.t.auth.welcome, icon:'success' })
          setTimeout(()=>uni.navigateBack(), 1000)
        }
      } catch(e) { uni.showModal({ title:'登录失败', content:e.message }) }
      this.loading=false
    },
    async onWxPhone(e) {
      if (!e.detail.code) return
      try {
        const r=await api.wxPhoneLogin({ phoneCode:e.detail.code })
        if (r.data?.token) {
          uni.setStorageSync('token', r.data.token)
          getApp().globalData.token=r.data.token
          const p=await api.getProfile()
          if (p.data) { uni.setStorageSync('userInfo', p.data); getApp().globalData.userInfo=p.data }
          uni.showToast({ title:this.t.auth.welcome, icon:'success' })
          setTimeout(()=>uni.navigateBack(), 1000)
        }
      } catch(e) { uni.showModal({ title:'登录失败', content:e.message }) }
    }
  }
}
</script>
<style lang="scss">
.page{min-height:100vh;background:#f5f5f5}
.hero{background:linear-gradient(145deg,#1a1a2e,#0f3460);padding:100rpx 40rpx 60rpx;display:flex;flex-direction:column;align-items:center;gap:16rpx}
.hero-emoji{font-size:100rpx}
.hero-title{font-size:48rpx;font-weight:bold;color:#fff}
.hero-sub{font-size:24rpx;color:rgba(255,255,255,.6);text-align:center}
.form{padding:40rpx 30rpx}
.wx-btn-wrap{margin-bottom:24rpx}
.wx-btn{background:#07c160;color:#fff;border:none;border-radius:50rpx;height:88rpx;font-size:30rpx;font-weight:bold;width:100%}
.divider{display:block;text-align:center;color:#bbb;font-size:24rpx;margin:24rpx 0}
.inp{background:#fff;border-radius:16rpx;padding:24rpx 28rpx;font-size:30rpx;margin-bottom:20rpx;display:block;box-shadow:0 2rpx 10rpx rgba(0,0,0,.05)}
.code-row{display:flex;gap:16rpx;margin-bottom:20rpx}
.code-inp{flex:1;margin:0}
.send-btn{width:220rpx;background:#1a1a2e;color:#fff;border:none;border-radius:16rpx;font-size:26rpx;flex-shrink:0}
.login-btn{width:100%;background:#1a1a2e;color:#fff;border:none;border-radius:50rpx;height:88rpx;font-size:32rpx;font-weight:bold;margin-bottom:20rpx}
.tip{display:block;text-align:center;font-size:22rpx;color:#bbb}
</style>

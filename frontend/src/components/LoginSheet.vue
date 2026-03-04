<!-- 半屏底部登录弹窗 -->
<template>
  <view v-if="visible" class="ls-wrap">
    <!-- 遮罩 -->
    <view class="ls-mask" @tap="close"/>
    <!-- 弹窗主体 -->
    <view class="ls-sheet" :class="{ 'ls-show': visible }">
      <view class="ls-handle"/>
      <text class="ls-title">登录 / 注册</text>
      <text class="ls-sub">未注册手机号将自动创建账号</text>

      <!-- #ifdef MP-WEIXIN -->
      <button open-type="getPhoneNumber" @getphonenumber="onWxPhone" class="wx-btn">💚 微信一键登录</button>
      <view class="ls-divider"><text class="ls-divider-txt">或手机号登录</text></view>
      <!-- #endif -->

      <input class="ls-inp" type="number" v-model="phone" placeholder="手机号" maxlength="11"/>
      <view class="ls-code-row">
        <input class="ls-inp ls-code-inp" type="number" v-model="code" placeholder="验证码" maxlength="6"/>
        <button class="ls-send-btn" :disabled="countdown>0||sending" @tap="sendCode">
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </button>
      </view>
      <button class="ls-login-btn" :disabled="loading" @tap="doLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </view>
  </view>
</template>

<script>
import { api } from '../api/index.js'
export default {
  name: 'LoginSheet',
  props: { visible: { type: Boolean, default: false } },
  emits: ['close', 'success'],
  data() { return { phone: '', code: '', countdown: 0, sending: false, loading: false } },
  methods: {
    close() { this.$emit('close') },
    async sendCode() {
      if (!/^1[3-9]\d{9}$/.test(this.phone)) { uni.showToast({ title: '请输入正确手机号', icon: 'none' }); return }
      this.sending = true
      try {
        await api.sendSms(this.phone)
        uni.showToast({ title: '验证码已发送', icon: 'none' })
        this.countdown = 60
        const t = setInterval(() => { if (--this.countdown <= 0) clearInterval(t) }, 1000)
      } catch(e) { uni.showModal({ title: '发送失败', content: e.message || '请稍后重试' }) }
      this.sending = false
    },
    async doLogin() {
      if (!this.phone || !this.code) { uni.showToast({ title: '请填写手机号和验证码', icon: 'none' }); return }
      this.loading = true
      try {
        const r = await api.phoneLogin(this.phone, this.code)
        if (r.data?.token) {
          uni.setStorageSync('token', r.data.token)
          getApp().globalData.token = r.data.token
          const p = await api.getProfile()
          if (p.data) { uni.setStorageSync('userInfo', p.data); getApp().globalData.userInfo = p.data }
          this.$emit('success', p.data)
          this.close()
        }
      } catch(e) { uni.showModal({ title: '登录失败', content: e.message || '请稍后重试' }) }
      this.loading = false
    },
    // #ifdef MP-WEIXIN
    async onWxPhone(e) {
      if (!e.detail.code) return
      try {
        const wx_code = await new Promise((r, j) => uni.login({ success: x => r(x.code), fail: j }))
        const r = await api.wxPhoneLogin({ phone_code: e.detail.code, wx_code })
        if (r.data?.token) {
          uni.setStorageSync('token', r.data.token)
          getApp().globalData.token = r.data.token
          const p = await api.getProfile()
          if (p.data) { uni.setStorageSync('userInfo', p.data); getApp().globalData.userInfo = p.data }
          this.$emit('success', p.data)
          this.close()
        }
      } catch(e) { uni.showModal({ title: '登录失败', content: e.message || '请稍后重试' }) }
    },
    // #endif
  }
}
</script>

<style lang="scss">
.ls-wrap  { position: fixed; inset: 0; z-index: 999; }
.ls-mask  { position: absolute; inset: 0; background: rgba(0,0,0,.45); }
.ls-sheet {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: #fff; border-radius: 32rpx 32rpx 0 0;
  padding: 24rpx 40rpx 60rpx;
  transform: translateY(100%);
  transition: transform .3s cubic-bezier(.4,0,.2,1);
}
.ls-show  { transform: translateY(0); }
.ls-handle { width: 60rpx; height: 8rpx; background: #e0e0e0; border-radius: 4rpx; margin: 0 auto 32rpx; }
.ls-title { display: block; font-size: 40rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 8rpx; }
.ls-sub   { display: block; font-size: 24rpx; color: #aaa; margin-bottom: 40rpx; }

.wx-btn { background: #1DB954; color: #fff; border-radius: 50rpx; height: 88rpx; font-size: 30rpx; margin-bottom: 24rpx; }
.ls-divider { display: flex; align-items: center; margin-bottom: 24rpx; }
.ls-divider::before,.ls-divider::after { content:''; flex:1; height:1rpx; background:#eee; }
.ls-divider-txt { font-size: 22rpx; color: #ccc; padding: 0 20rpx; }

.ls-inp {
  width: 100%; height: 88rpx; background: #f5f5f5;
  border-radius: 16rpx; padding: 0 28rpx;
  font-size: 30rpx; color: #1a1a1a; margin-bottom: 20rpx;
  box-sizing: border-box;
}
.ls-code-row { display: flex; gap: 16rpx; margin-bottom: 20rpx; }
.ls-code-inp { flex: 1; margin-bottom: 0; }
.ls-send-btn {
  flex-shrink: 0; height: 88rpx; padding: 0 28rpx;
  background: #f0f2f5; color: #555; font-size: 26rpx;
  border-radius: 16rpx; white-space: nowrap;
}
.ls-send-btn[disabled] { opacity: .5; }
.ls-login-btn {
  width: 100%; height: 96rpx; background: #1a1a2e;
  color: #fff; border-radius: 50rpx; font-size: 32rpx; margin-top: 8rpx;
}
</style>

<template>
  <view v-if="visible" class="ls-wrap">
    <view class="ls-mask" @tap="$emit('close')"/>
    <view class="ls-sheet" :class="{'ls-show': visible}">
      <view class="ls-handle"/>

      <!-- 默认：两个选项 -->
      <view v-if="step==='options'">
        <text class="ls-title">登录 铭心乐Go</text>
        <text class="ls-sub">登录后享受完整功能</text>

        <!-- 微信登录 -->
        <view class="ls-btn ls-wechat" @tap="wxLogin">
          <text class="ls-btn-icon">💬</text>
          <text class="ls-btn-txt">微信快速登录</text>
        </view>

        <!-- 短信登录 -->
        <view class="ls-btn ls-sms" @tap="step='sms'">
          <text class="ls-btn-icon">📱</text>
          <text class="ls-btn-txt">短信登录</text>
        </view>

        <text class="ls-agree">登录即同意 <text class="ls-link">用户协议</text> 和 <text class="ls-link">隐私政策</text></text>
      </view>

      <!-- 短信登录 -->
      <view v-if="step==='sms'">
        <view class="ls-back" @tap="step='options'">‹ 返回</view>
        <text class="ls-title">短信登录</text>

        <view class="ls-input-wrap">
          <text class="ls-input-prefix">+86</text>
          <input class="ls-input" v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" placeholder-class="ls-ph"/>
        </view>

        <view class="ls-input-wrap">
          <input class="ls-input" v-model="code" type="number" maxlength="6" placeholder="请输入验证码" placeholder-class="ls-ph"/>
          <view :class="['ls-sms-btn', countdown>0&&'ls-sms-cd']" @tap="sendCode">
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </view>
        </view>

        <view :class="['ls-btn ls-confirm', (!phone||!code)&&'ls-disabled']" @tap="doLogin">
          <text class="ls-btn-txt">登录</text>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
import { api } from '../api/index.js'
export default {
  name: 'LoginSheet',
  props: { visible: { type: Boolean, default: false } },
  emits: ['close', 'success'],
  data() { return { step: 'options', phone: '', code: '', countdown: 0, timer: null } },
  watch: {
    visible(v) { if (v) { this.step = 'options'; this.phone = ''; this.code = '' } }
  },
  methods: {
    async wxLogin() {
      // #ifdef MP-WEIXIN
      try {
        const { code } = await new Promise((res, rej) => wx.login({ success: res, fail: rej }))
        const r = await api.wxLogin({ code })
        this._onSuccess(r.data)
      } catch(e) { uni.showToast({ title: '微信登录失败', icon: 'none' }) }
      // #endif
      // #ifndef MP-WEIXIN
      uni.showToast({ title: '请在小程序中使用微信登录', icon: 'none' })
      // #endif
    },
    async sendCode() {
      if (this.countdown > 0) return
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return
      }
      try {
        await api.sendSms({ phone: this.phone })
        uni.showToast({ title: '验证码已发送', icon: 'success' })
        this.countdown = 60
        this.timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) clearInterval(this.timer)
        }, 1000)
      } catch(e) { uni.showToast({ title: '发送失败，请重试', icon: 'none' }) }
    },
    async doLogin() {
      if (!this.phone || !this.code) return
      try {
        const r = await api.phoneLogin({ phone: this.phone, code: this.code })
        this._onSuccess(r.data)
      } catch(e) { uni.showToast({ title: '登录失败，请检查验证码', icon: 'none' }) }
    },
    _onSuccess(data) {
      const token = data.access || data.token
      const userInfo = data.user || data.userInfo || {}
      uni.setStorageSync('token', token)
      uni.setStorageSync('userInfo', userInfo)
      getApp().globalData.token = token
      getApp().globalData.userInfo = userInfo
      this.$emit('success', userInfo)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
.ls-wrap  { position: fixed; inset: 0; z-index: 998; }
.ls-mask  { position: absolute; inset: 0; background: rgba(0,0,0,.5); }
.ls-sheet {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: #fff; border-radius: 32rpx 32rpx 0 0;
  padding: 24rpx 48rpx 60rpx;
  transform: translateY(100%);
  transition: transform .3s cubic-bezier(.4,0,.2,1);
}
.ls-show { transform: translateY(0); }
.ls-handle { width: 60rpx; height: 8rpx; background: #e0e0e0; border-radius: 4rpx; margin: 0 auto 36rpx; }

.ls-title { display: block; font-size: 40rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 8rpx; }
.ls-sub   { display: block; font-size: 26rpx; color: #aaa; margin-bottom: 48rpx; }

.ls-btn {
  display: flex; align-items: center; justify-content: center; gap: 16rpx;
  height: 96rpx; border-radius: 50rpx; margin-bottom: 20rpx;
}
.ls-wechat { background: #07c160; }
.ls-sms    { background: #f5f5f5; }
.ls-confirm { background: #1a1a2e; }
.ls-disabled { opacity: .4; }

.ls-btn-icon { font-size: 36rpx; }
.ls-wechat .ls-btn-txt  { font-size: 32rpx; font-weight: 600; color: #fff; }
.ls-sms .ls-btn-txt     { font-size: 32rpx; font-weight: 600; color: #1a1a1a; }
.ls-confirm .ls-btn-txt { font-size: 32rpx; font-weight: 600; color: #fff; }

.ls-agree { display: block; text-align: center; font-size: 22rpx; color: #bbb; margin-top: 24rpx; }
.ls-link  { color: #888; }

/* 短信登录 */
.ls-back  { font-size: 28rpx; color: #888; margin-bottom: 24rpx; }
.ls-input-wrap {
  display: flex; align-items: center;
  border: 2rpx solid #e8e8e8; border-radius: 16rpx;
  padding: 0 24rpx; height: 96rpx; margin-bottom: 20rpx;
}
.ls-input-prefix { font-size: 30rpx; color: #333; font-weight: 500; margin-right: 16rpx; border-right: 2rpx solid #e8e8e8; padding-right: 16rpx; }
.ls-input { flex: 1; font-size: 30rpx; color: #1a1a1a; }
.ls-ph    { color: #ccc; }
.ls-sms-btn { font-size: 26rpx; color: #1a1a2e; font-weight: 600; white-space: nowrap; padding-left: 16rpx; }
.ls-sms-cd  { color: #bbb; }
</style>

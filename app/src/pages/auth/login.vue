<template>
  <view class="login-page">
    <view class="logo-area">
      <image class="logo" src="/static/images/logo.png" mode="aspectFit" />
      <text class="app-name">羽毛球赛事</text>
      <text class="slogan">报名 · 对战 · 争冠</text>
    </view>

    <view class="login-area">
      <button class="wx-login-btn" @click="handleWxLogin" :loading="loading">
        <image src="/static/icons/wechat.png" class="wx-icon" />
        微信一键登录
      </button>
      <text class="privacy-tip">登录即代表同意《用户协议》和《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../store/modules/user'
import { wxLogin, getUserInfo } from '../../api/auth'

const userStore = useUserStore()
const loading = ref(false)

const handleWxLogin = async () => {
  loading.value = true
  try {
    // 1. 获取微信 code
    const loginRes = await uni.login({ provider: 'weixin' })
    // 2. 用 code 换取 token
    const res = await wxLogin(loginRes.code)
    userStore.setToken(res.data.token)
    // 3. 获取用户信息
    const userRes = await getUserInfo()
    userStore.setUserInfo(userRes.data)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/index' })
    }, 800)
  } catch (e) {
    console.error('登录失败', e)
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #1DB954 0%, #0a7a33 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 120rpx 60rpx 100rpx;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  .logo { width: 160rpx; height: 160rpx; margin-bottom: 30rpx; }
  .app-name { font-size: 56rpx; font-weight: bold; color: #fff; margin-bottom: 16rpx; }
  .slogan { font-size: 28rpx; color: rgba(255,255,255,0.8); }
}

.login-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .wx-login-btn {
    width: 100%;
    height: 96rpx;
    background: #fff;
    color: #1DB954;
    border-radius: 50rpx;
    font-size: 34rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.15);
    .wx-icon { width: 48rpx; height: 48rpx; margin-right: 16rpx; }
  }

  .privacy-tip {
    margin-top: 30rpx;
    font-size: 22rpx;
    color: rgba(255,255,255,0.7);
  }
}
</style>

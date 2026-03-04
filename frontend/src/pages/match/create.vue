<template>
  <view class="page">
    <view class="section">
      <text class="sec-label">📋 基本信息</text>
      <input class="inp" v-model="form.name" :placeholder="t.match.name" />
      <input class="inp" v-model="form.location" :placeholder="t.match.location" />
    </view>
    <view class="section">
      <text class="sec-label">⚙️ {{ t.match.format }}</text>
      <view class="type-row">
        <view v-for="tp in types" :key="tp.k" :class="['type-card', form.matchType===tp.k?'type-active':'']" @tap="form.matchType=tp.k">
          <text style="font-size:36rpx;margin-bottom:6rpx">{{ tp.icon }}</text>
          <text style="font-size:24rpx">{{ t.match.types[tp.k] }}</text>
        </view>
      </view>
      <view class="counter-row">
        <text class="sec-label">{{ t.match.maxPlayers }}</text>
        <view class="counter">
          <view class="cnt-btn" @tap="form.maxPlayers=Math.max(4,form.maxPlayers-1)">−</view>
          <text class="cnt-n">{{ form.maxPlayers }}</text>
          <view class="cnt-btn" @tap="form.maxPlayers=Math.min(64,form.maxPlayers+1)">+</view>
        </view>
      </view>
    </view>
    <view class="section">
      <text class="sec-label">📝 {{ t.match.desc }}</text>
      <textarea class="textarea" v-model="form.description" :placeholder="t.match.desc" />
    </view>
    <view class="btn-row">
      <button class="btn-draft" @tap="submit('draft')" :disabled="saving">{{ t.match.draft }}</button>
      <button :class="['btn-publish', sport==='tennis'?'tennis-pub':'']" @tap="submit('open')" :disabled="saving">{{ saving?'...' : t.match.publish }}</button>
    </view>
  </view>
</template>
<script>
import { t } from '../../locales/index.js'
import { api } from '../../api/index.js'
export default {
  data() {
    return { t:t(), sport:'badminton', saving:false,
      form:{ name:'', location:'', matchType:'round_robin', maxPlayers:16, description:'', levels:[], status:'open' },
      types:[{k:'round_robin',icon:'🔄'},{k:'knockout',icon:'⚡'},{k:'group',icon:'🏟️'}] }
  },
  onLoad(opts) { if (opts.sport) this.sport=opts.sport },
  methods: {
    async submit(status) {
      if (!this.form.name || !this.form.location) { uni.showToast({title:'请填写赛事名称和场地',icon:'none'}); return }
      this.saving=true
      try {
        const r=await api.createMatch({ ...this.form, status })
        if (r.code===0) {
          uni.showToast({ title:status==='open'?'发布成功 🎉':'已存草稿', icon:'success' })
          setTimeout(()=>uni.navigateBack(), 1500)
        }
      } catch(e) { uni.showModal({ title:'错误', content:e.message }) }
      this.saving=false
    }
  }
}
</script>
<style lang="scss">
.page{background:#f5f5f5;min-height:100vh;padding:24rpx;padding-bottom:100rpx}
.section{background:#fff;border-radius:24rpx;padding:30rpx;margin-bottom:20rpx;box-shadow:0 4rpx 16rpx rgba(0,0,0,.06)}
.sec-label{display:block;font-size:28rpx;font-weight:bold;color:#1a1a1a;margin-bottom:20rpx}
.inp{display:block;width:100%;background:#f8f8f8;border-radius:16rpx;padding:24rpx 28rpx;font-size:30rpx;margin-bottom:16rpx;box-sizing:border-box}
.type-row{display:flex;gap:16rpx;margin-bottom:24rpx}
.type-card{flex:1;display:flex;flex-direction:column;align-items:center;padding:24rpx 0;border-radius:20rpx;background:#f8f8f8;border:2rpx solid transparent;transition:all .2s}
.type-active{background:#f0faf5;border-color:#1DB954}
.counter-row{display:flex;align-items:center;justify-content:space-between}
.counter-row .sec-label{margin:0}
.counter{display:flex;align-items:center;gap:24rpx}
.cnt-btn{width:60rpx;height:60rpx;background:#f0f0f0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36rpx;font-weight:bold}
.cnt-n{font-size:48rpx;font-weight:bold;min-width:60rpx;text-align:center}
.textarea{width:100%;background:#f8f8f8;border-radius:16rpx;padding:24rpx 28rpx;font-size:28rpx;min-height:160rpx;box-sizing:border-box}
.btn-row{display:flex;gap:20rpx;margin-top:8rpx}
.btn-draft{flex:1;background:#f0f0f0;color:#666;border-radius:50rpx;height:88rpx;line-height:88rpx;font-size:30rpx;border:none}
.btn-publish{flex:2;background:#1DB954;color:#fff;border-radius:50rpx;height:88rpx;line-height:88rpx;font-size:32rpx;font-weight:bold;border:none}
.tennis-pub{background:#d4541f}
</style>

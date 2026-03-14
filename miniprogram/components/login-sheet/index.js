const { api, BASE_URL, resolveUrl } = require('../../utils/api')
Component({
  properties:{visible:{type:Boolean,value:false}},
  observers:{'visible'(v){if(v)this.setData({step:'options',phone:'',code:'',errorMsg:'',loading:false})}},
  data:{step:'options',phone:'',code:'',countdown:0,loading:false,errorMsg:'',profileAvatar:'',profileNickname:''},
  methods:{
    onClose(){this.triggerEvent('close')},
    goOptions(){this.setData({step:'options',errorMsg:''})},
    goSms(){this.setData({step:'sms',errorMsg:''})},
    onPhone(e){this.setData({phone:e.detail.value})},
    onCode(e){this.setData({code:e.detail.value})},
    async wxLogin(e){
      // e.detail.code 是 phoneCode；用户拒绝时 errMsg 不含 'ok'
      if(this.data.loading)return
      if(!e.detail.code){
        this.setData({errorMsg:'需要授权手机号才能登录'})
        return
      }
      this.setData({loading:true,errorMsg:''})
      try{
        const phoneCode=e.detail.code
        const res=await new Promise((ok,err)=>wx.login({success:ok,fail:err}))
        const r=await api.wxPhoneLogin({phone_code:phoneCode,wx_code:res.code})
        this._success(r.data)
      }catch(e){
        const msg=(e&&e.data&&e.data.message)||(e&&e.errMsg)||'微信登录失败，请重试'
        this.setData({errorMsg:msg})
      }
      finally{this.setData({loading:false})}
    },
    async sendCode(){
      if(this.data.countdown>0)return
      const phone=this.data.phone
      if(!phone||phone.length!==11){wx.showToast({title:'请输入正确的手机号',icon:'none'});return}
      try{
        await api.sendSms({phone})
        wx.showToast({title:'验证码已发送',icon:'success'})
        this.setData({countdown:60})
        const t=setInterval(()=>{
          const c=this.data.countdown-1
          this.setData({countdown:c})
          if(c<=0)clearInterval(t)
        },1000)
      }catch(e){wx.showToast({title:'发送失败，请重试',icon:'none'})}
    },
    async doLogin(){
      const{phone,code,loading}=this.data
      if(!phone||!code||loading)return
      this.setData({loading:true,errorMsg:''})
      try{
        const r=await api.phoneLogin({phone,code})
        this._success(r.data)
      }catch(e){
        const msg=e&&e.data?(e.data.detail||e.data.message||e.data.error||'验证码错误或已过期'):'网络连接失败，请检查网络'
        this.setData({errorMsg:msg})
      }
      finally{this.setData({loading:false})}
    },
    _success(data){
      const inner=data.data||data
      const token=inner.access||inner.token||data.access||data.token
      const userInfo=inner.user||inner.userInfo||data.user||data.userInfo||{}
      wx.setStorageSync('token',token)
      wx.setStorageSync('userInfo',userInfo)
      getApp().globalData.token=token
      getApp().globalData.userInfo=userInfo
      // activeSport 以数据库为准；fallback：单项=该运动，双栖=badminton
      const activeSport=userInfo.activeSport
        ||(userInfo.sportPref&&userInfo.sportPref!=='both'?userInfo.sportPref:'badminton')
      wx.setStorageSync('activeSport', activeSport)
      // canSwitch：是否双栖（本地只存这一个布尔值，不存 sportPref）
      wx.setStorageSync('canSwitch', userInfo.sportPref==='both')
      // 新用户 → 弹出完善资料步骤
      if(userInfo.isNew){
        this.setData({step:'profile',profileAvatar:'',profileNickname:''})
        return
      }
      this.triggerEvent('success',userInfo)
      this.triggerEvent('close')
    },
    // ─── 完善资料步骤 ───
    onProfileAvatar(e){
      const url=e.detail.avatarUrl
      if(url)this.setData({profileAvatar:url})
    },
    onProfileNickname(e){
      this.setData({profileNickname:e.detail.value||''})
    },
    async saveProfile(){
      if(this.data.loading)return
      this.setData({loading:true})
      const token=wx.getStorageSync('token')
      const ORIGIN=BASE_URL.replace('/api','')
      const tasks=[]
      // 上传头像
      if(this.data.profileAvatar){
        tasks.push(new Promise((resolve,reject)=>{
          wx.uploadFile({
            url:BASE_URL+'/auth/upload-avatar',
            filePath:this.data.profileAvatar,
            name:'avatar',
            header:{Authorization:'Bearer '+token},
            success(res){
              try{
                const d=JSON.parse(res.data)
                if(d.code===0)resolve(ORIGIN+d.data.url)
                else resolve('')
              }catch(e){resolve('')}
            },
            fail(){resolve('')}
          })
        }))
      }
      // 保存昵称
      const nick=(this.data.profileNickname||'').trim()
      if(nick){
        tasks.push(api.updateProfile({nickname:nick}).then(()=>nick).catch(()=>''))
      }
      try{
        const results=await Promise.all(tasks)
        const user=wx.getStorageSync('userInfo')||{}
        let idx=0
        if(this.data.profileAvatar){
          const avatarUrl=results[idx++]
          if(avatarUrl){user.avatar=avatarUrl}
        }
        if(nick){
          const savedNick=results[idx++]
          if(savedNick){user.nickname=savedNick}
        }
        wx.setStorageSync('userInfo',user)
        getApp().globalData.userInfo=user
      }catch(e){}
      this.setData({loading:false})
      this.triggerEvent('success',wx.getStorageSync('userInfo')||{})
      this.triggerEvent('close')
    },
    skipProfile(){
      this.triggerEvent('success',wx.getStorageSync('userInfo')||{})
      this.triggerEvent('close')
    }
  }
})
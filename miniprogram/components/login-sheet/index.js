const { api } = require('../../utils/api')
Component({
  properties:{visible:{type:Boolean,value:false}},
  observers:{'visible'(v){if(v)this.setData({step:'options',phone:'',code:'',errorMsg:'',loading:false})}},
  data:{step:'options',phone:'',code:'',countdown:0,loading:false,errorMsg:''},
  methods:{
    onClose(){this.triggerEvent('close')},
    goOptions(){this.setData({step:'options',errorMsg:''})},
    goSms(){this.setData({step:'sms',errorMsg:''})},
    onPhone(e){this.setData({phone:e.detail.value})},
    onCode(e){this.setData({code:e.detail.value})},
    async wxLogin(){
      if(this.data.loading)return
      this.setData({loading:true,errorMsg:''})
      try{
        const res=await new Promise((ok,err)=>wx.login({success:ok,fail:err}))
        const r=await api.wxLogin({code:res.code})
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
      this.triggerEvent('success',userInfo)
      this.triggerEvent('close')
    }
  }
})
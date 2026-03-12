Component({
  properties:{visible:{type:Boolean,value:false}},
  data:{selected:''},
  methods:{
    selB(){this.setData({selected:'badminton'})},
    selT(){this.setData({selected:'tennis'})},
    selBoth(){this.setData({selected:'both'})},
    onMaskTap(){this.triggerEvent('close')},
    confirm(){
      if(!this.data.selected)return
      const pref=this.data.selected
      const canSwitch=pref==='both'
      // activeSport: 单项锁定，双栖保持已有值或默认 badminton
      let activeSport=pref!=='both'?pref:(wx.getStorageSync('activeSport')||'badminton')
      wx.setStorageSync('activeSport', activeSport)
      wx.setStorageSync('canSwitch', canSwitch)
      const userInfo = wx.getStorageSync('userInfo') || {}
      userInfo.sportPref = pref
      userInfo.activeSport = activeSport
      wx.setStorageSync('userInfo', userInfo)
      this.triggerEvent('confirm', {pref, activeSport, canSwitch})
      // 同步到后端
      const token=wx.getStorageSync('token')
      if(token){
        const {api}=require('../../utils/api')
        api.updateProfile({sportPref:pref, activeSport}).catch(()=>{})
      }
    }
  }
})

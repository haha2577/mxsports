Component({
  properties:{visible:{type:Boolean,value:false}},
  data:{selected:''},
  methods:{
    selB(){this.setData({selected:'badminton'})},
    selT(){this.setData({selected:'tennis'})},
    selBoth(){this.setData({selected:'both'})},
    confirm(){
      if(!this.data.selected)return
      const pref=this.data.selected
      wx.setStorageSync('sportPref',pref)
      // sportPref 改为单项时，强制同步 activeSport
      if(pref!=='both'){
        wx.setStorageSync('activeSport',pref)
      } else {
        // both: 保持现有 activeSport，没有则默认 badminton
        if(!wx.getStorageSync('activeSport')){
          wx.setStorageSync('activeSport','badminton')
        }
      }
      this.triggerEvent('confirm',pref)
      // 同步到后端（sportPref + activeSport 一起更新）
      const token=wx.getStorageSync('token')
      if(token){
        const {api}=require('../../utils/api')
        const activeSport=wx.getStorageSync('activeSport')
        api.updateProfile({sportPref:pref, activeSport}).catch(()=>{})
      }
    }
  }
})
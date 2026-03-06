Component({
  properties:{visible:{type:Boolean,value:false}},
  data:{selected:''},
  methods:{
    selB(){this.setData({selected:'badminton'})},
    selT(){this.setData({selected:'tennis'})},
    selBoth(){this.setData({selected:'both'})},
    confirm(){
      if(!this.data.selected)return
      wx.setStorageSync('sportPref',this.data.selected)
      this.triggerEvent('confirm',this.data.selected)
      // 同步到后端
      const token=wx.getStorageSync('token')
      if(token){
        const {api}=require('../../utils/api')
        api.updateProfile({sportPref:this.data.selected}).catch(()=>{})
      }
    }
  }
})
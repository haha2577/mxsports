const { applySport, getSportData } = require('../../../utils/sport-config')
const{api}=require('../../../utils/api')
Page({
  data:{...getSportData('badminton'),venue:null,loading:true,tags:[],navTitle:'场馆详情'},
  onLoad(opts){
    applySport(this)
    if(opts.id)this._load(opts.id)
  },
  navigateBack(){wx.navigateBack()},
  async _load(id){
    try{
      const r=await api.venueDetail(id)
      const v=r.data.data
      const tags=[]
      if(v.isIndoor)tags.push('室内')
      else tags.push('室外')
      tags.push(`${v.courtCount}片场地`)
      tags.push(v.floorLabel)
      if(v.hasAc)tags.push('空调')
      if(v.hasParking)tags.push(v.parkingSufficient?'停车充足':'有停车位')
      if(v.hasShower)tags.push('淋浴')
      if(v.hasLocker)tags.push('储物柜')
      this.setData({venue:v,tags,loading:false,navTitle:v.name||'场馆详情'})
    }catch(e){
      this.setData({loading:false})
      wx.showToast({title:'加载失败',icon:'none'})
    }
  },
  callPhone(){
    const phone=this.data.venue&&this.data.venue.phone
    if(phone)wx.makePhoneCall({phoneNumber:phone})
    else wx.showToast({title:'暂无电话',icon:'none'})
  },
  openMap(){
    const v=this.data.venue
    if(v&&v.latitude)wx.openLocation({latitude:v.latitude,longitude:v.longitude,name:v.name,address:v.address,scale:16})
  },
  onShareAppMessage(){
    const v=this.data.venue
    return{title:v?v.name:'球馆详情',path:`/pages/venue/detail/index?id=${v?v.id:0}`}
  }
})

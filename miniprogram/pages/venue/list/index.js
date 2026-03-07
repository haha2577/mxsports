const { GRAD_B, GRAD_T, gradOf, readSport, switchSport } = require('../../utils/theme')
const{api}=require('../../../utils/api')
Page({
  data:{sport:'badminton',sportPref:'',heroGrad:GRAD_B,city:'',filterOpen:false,list:[],hasFilter:false,lat:0,lng:0,loading:true},
  onLoad(opts){
    
    const sport=opts.sport||wx.getStorageSync('activeSport')||'badminton'
    const pref=wx.getStorageSync('sportPref')||''
    this.setData({sport,sportPref:pref,heroGrad:gradOf(sport)})
    this._getLocation()
  },
  _getLocation(){
    wx.getLocation({
      type:'gcj02',
      success:res=>{
        this.setData({lat:res.latitude,lng:res.longitude})
        this._load(this.data.sport)
      },
      fail:()=>{
        // 定位失败，使用默认深圳坐标
        this.setData({lat:22.5431,lng:114.0579,city:'深圳市'})
        this._load(this.data.sport)
      }
    })
  },
  _load(sport){
    this.setData({loading:true})
    let qs=`?sport=${sport}&lat=${this.data.lat}&lng=${this.data.lng}`
    if(this.data.city)qs+=`&city=${this.data.city}`
    api.venues(qs).then(res=>{
      const d=res.data.data||res.data||[]
      const list=Array.isArray(d)?d:[]
      this.setData({list,loading:false,hasFilter:this.data.filterOpen})
    }).catch(()=>{
      this.setData({list:[],loading:false})
    })
  },
  onSwitchSport(e){const s=e.detail;wx.setStorageSync('activeSport',s);this.setData({sport:s,heroGrad:gradOf(s)});this._load(s)},
  toggleOpen(){this.setData({filterOpen:!this.data.filterOpen});this._load(this.data.sport)},
  resetAll(){this.setData({filterOpen:false});this._load(this.data.sport)},
  navigateBack(){wx.navigateBack()},
  goDetail(e){wx.navigateTo({url:'/pages/venue/detail/index?id='+e.currentTarget.dataset.id})},
  goBook(){wx.showToast({title:'预约功能开发中',icon:'none'})},
})

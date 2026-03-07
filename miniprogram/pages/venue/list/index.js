const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
const{api}=require('../../../utils/api')
Page({
  data:{sport:'badminton',heroGrad:GRAD_B,city:'',filterOpen:false,list:[],hasFilter:false,lat:0,lng:0,loading:true},
  onLoad(opts){
    const sport=opts.sport||wx.getStorageSync('activeSport')||'badminton'
    this.setData({sport,heroGrad:sport==='tennis'?GRAD_T:GRAD_B})
    this._getLocation()
  },
  onShow(){
    const sport=wx.getStorageSync('activeSport')||'badminton'
    if(sport!==this.data.sport){
      this.setData({sport,heroGrad:sport==='tennis'?GRAD_T:GRAD_B})
      this._load(sport)
    }
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
  onSwitchSport(e){const s=e.detail;wx.setStorageSync('activeSport',s);this.setData({sport:s,heroGrad:s==='tennis'?GRAD_T:GRAD_B});this._load(s)},
  toggleOpen(){this.setData({filterOpen:!this.data.filterOpen});this._load(this.data.sport)},
  resetAll(){this.setData({filterOpen:false});this._load(this.data.sport)},
  navigateBack(){wx.navigateBack()},
  goDetail(e){wx.navigateTo({url:'/pages/venue/detail/index?id='+e.currentTarget.dataset.id})},
  goBook(){wx.showToast({title:'预约功能开发中',icon:'none'})}})

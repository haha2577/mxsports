const { VENUES } = require('../../../store/mockData')
const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
Page({
  data:{sport:'badminton',sportPref:'',heroGrad:GRAD_B,city:'北京',filterOpen:false,list:[],hasFilter:false},
  onLoad(opts){
    const sport=opts.sport||wx.getStorageSync('activeSport')||'badminton'
    const pref=wx.getStorageSync('sportPref')||''
    this.setData({sport,sportPref:pref,heroGrad:sport==='badminton'?GRAD_B:GRAD_T})
    this._load(sport)
  },
  _load(sport){
    let list=VENUES[sport]||[]
    if(this.data.filterOpen)list=list.filter(v=>v.isOpen)
    this.setData({list,hasFilter:this.data.filterOpen})
  },
  onSwitchSport(e){const s=e.detail;wx.setStorageSync('activeSport',s);this.setData({sport:s,heroGrad:s==='badminton'?GRAD_B:GRAD_T});this._load(s)},
  toggleOpen(){this.setData({filterOpen:!this.data.filterOpen});this._load(this.data.sport)},
  resetAll(){this.setData({filterOpen:false});this._load(this.data.sport)},
  pickCity(){wx.showActionSheet({itemList:['北京','上海','广州','深圳','成都','杭州'],success:r=>this.setData({city:['北京','上海','广州','深圳','成都','杭州'][r.tapIndex]})})},
  goDetail(e){wx.navigateTo({url:'/pages/venue/detail/index?id='+e.currentTarget.dataset.id})},
  goBook(){wx.showToast({title:'预约功能开发中',icon:'none'})},
})
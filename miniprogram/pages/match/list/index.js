const { MATCHES } = require('../../../store/mockData')
const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
Page({
  data:{sport:'badminton',sportPref:'',keyword:'',filterLevel:'',filterFee:'',heroGrad:GRAD_B,list:[],hasFilter:false,feeLabel:''},
  onLoad(opts){
    const sport=opts.sport||wx.getStorageSync('activeSport')||'badminton'
    const pref=wx.getStorageSync('sportPref')||''
    this.setData({sport,sportPref:pref,heroGrad:sport==='badminton'?GRAD_B:GRAD_T})
    this._load(sport)
  },
  _load(sport){
    let list=MATCHES[sport]||[]
    const {keyword,filterLevel,filterFee}=this.data
    if(keyword)list=list.filter(m=>m.name.includes(keyword)||m.location.includes(keyword))
    if(filterLevel)list=list.filter(m=>m.level===filterLevel)
    if(filterFee==='free')list=list.filter(m=>m.fee===0)
    if(filterFee==='50')list=list.filter(m=>m.fee<=50&&m.fee>0)
    this.setData({list,hasFilter:!!(filterLevel||filterFee)})
  },
  onSwitchSport(e){const s=e.detail;wx.setStorageSync('activeSport',s);this.setData({sport:s,heroGrad:s==='badminton'?GRAD_B:GRAD_T});this._load(s)},
  onKeyword(e){this.setData({keyword:e.detail.value});this._load(this.data.sport)},
  openLevel(){wx.showActionSheet({itemList:['入门','业余','中级','高级','不限'],success:r=>{const l=r.tapIndex===4?'':['入门','业余','中级','高级'][r.tapIndex];this.setData({filterLevel:l});this._load(this.data.sport)}});},
  openFee(){wx.showActionSheet({itemList:['免费','50元以内','全部'],success:r=>{const f=['free','50',''][r.tapIndex];this.setData({filterFee:f,feeLabel:['免费','50元以内',''][r.tapIndex]});this._load(this.data.sport)}});},
  resetAll(){this.setData({filterLevel:'',filterFee:'',feeLabel:''});this._load(this.data.sport)},
  goDetail(e){wx.navigateTo({url:'/pages/match/detail/index?id='+e.currentTarget.dataset.id})},
  goCreate(){wx.navigateTo({url:'/pages/match/create/index'})},
})
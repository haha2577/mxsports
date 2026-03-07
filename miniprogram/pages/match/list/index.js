const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
const { api } = require('../../../utils/api')
Page({
  data:{sport:'badminton',sportPref:'',keyword:'',filterLevel:'',filterFee:'',heroGrad:GRAD_B,list:[],loading:false,hasFilter:false,feeLabel:''},
  onLoad(opts){
    const sport=opts.sport||wx.getStorageSync('activeSport')||'badminton'
    const pref=wx.getStorageSync('sportPref')||''
    
    this.setData({sport,sportPref:pref,heroGrad:sport==='tennis'?GRAD_T:GRAD_B})
    this._load()
  },
  onShow(){
    const sport=wx.getStorageSync('activeSport')||'badminton'
    this.setData({sport,heroGrad:sport==='tennis'?GRAD_T:GRAD_B})
    this._load()
  },
  async _load(){
    this.setData({loading:true})
    try{
      const {keyword,filterLevel,filterFee,sport}=this.data
      let qs='?status=open'
      if(sport) qs+=`&sport=${sport}`
      if(keyword) qs+=`&search=${encodeURIComponent(keyword)}`
      const r=await api.matches(qs)
      let list=(r.data.data&&r.data.data.list)||r.data.data||[]
      // 本地过滤（后端暂不支持这些参数时兜底）
      if(filterLevel) list=list.filter(m=>(m.levels||[]).includes(filterLevel)||(m.level===filterLevel))
      if(filterFee==='free') list=list.filter(m=>!m.fee||m.fee==0)
      if(filterFee==='50') list=list.filter(m=>m.fee<=50&&m.fee>0)
      this.setData({list})
    }catch(e){
      wx.showToast({title:'加载失败',icon:'none'})
    }finally{
      this.setData({loading:false})
    }
  },
  onSwitchSport(e){const s=e.detail;wx.setStorageSync('activeSport',s);this.setData({sport:s,heroGrad:s==='tennis'?GRAD_T:GRAD_B});this._load()},
  onKeyword(e){this.setData({keyword:e.detail.value});this._load()},
  openLevel(){wx.showActionSheet({itemList:['入门','业余','中级','高级','不限'],success:r=>{const l=r.tapIndex===4?'':['入门','业余','中级','高级'][r.tapIndex];this.setData({filterLevel:l,hasFilter:!!(l||(this.data.filterFee))});this._load()}})},
  openFee(){wx.showActionSheet({itemList:['免费','50元以内','全部'],success:r=>{const f=['free','50',''][r.tapIndex];this.setData({filterFee:f,feeLabel:['免费','50元以内',''][r.tapIndex],hasFilter:!!(this.data.filterLevel||f)});this._load()}})},
  resetAll(){this.setData({filterLevel:'',filterFee:'',feeLabel:'',hasFilter:false});this._load()},
  navigateBack(){wx.navigateBack()},
  goDetail(e){wx.navigateTo({url:'/pages/match/detail/index?id='+e.currentTarget.dataset.id})},
  goCreate(){wx.navigateTo({url:'/pages/match/create/index'})},
  _fmtTime(dt){
    if(!dt)return''
    const d=new Date(dt)
    return `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  },
})

const { applySport, switchSport, getSportData } = require('../../../utils/sport-config')
const { api } = require('../../../utils/api')
const { fmtTime } = require('../../../utils/time')
Page({
  data:{...getSportData('badminton'),keyword:'',filterLevel:'',filterFee:'',list:[],loading:false,hasFilter:false,feeLabel:''},
  onLoad(opts){
    const sport=applySport(this, opts.sport)
    this._load()
  },
  onShow(){
    applySport(this)
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
      if(filterLevel) list=list.filter(m=>(m.levels||[]).includes(filterLevel)||(m.level===filterLevel))
      if(filterFee==='free') list=list.filter(m=>!m.fee||m.fee==0)
      if(filterFee==='50') list=list.filter(m=>m.fee<=50&&m.fee>0)
      this.setData({list:list.map(m=>({...m,startTime:fmtTime(m.startTime)}))})
    }catch(e){
      wx.showToast({title:'加载失败',icon:'none'})
    }finally{
      this.setData({loading:false})
    }
  },
  onSwitchSport(e){ switchSport(this, e, () => this._load()) },
  onKeyword(e){this.setData({keyword:e.detail.value});this._load()},
  openLevel(){wx.showActionSheet({itemList:['入门','业余','中级','高级','不限'],success:r=>{const l=r.tapIndex===4?'':['入门','业余','中级','高级'][r.tapIndex];this.setData({filterLevel:l,hasFilter:!!(l||(this.data.filterFee))});this._load()}})},
  openFee(){wx.showActionSheet({itemList:['免费','50元以内','全部'],success:r=>{const f=['free','50',''][r.tapIndex];this.setData({filterFee:f,feeLabel:['免费','50元以内',''][r.tapIndex],hasFilter:!!(this.data.filterLevel||f)});this._load()}})},
  resetAll(){this.setData({filterLevel:'',filterFee:'',feeLabel:'',hasFilter:false});this._load()},
  navigateBack(){wx.navigateBack()},
  goDetail(e){wx.navigateTo({url:'/pages/match/detail/index?id='+e.currentTarget.dataset.id})},
  goCreate(){wx.navigateTo({url:'/pages/match/create/index'})},
})

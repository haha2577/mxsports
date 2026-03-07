const { GRAD_B, GRAD_T, gradOf, readSport, switchSport } = require('../../utils/theme')
const{api}=require('../../../utils/api')
const CAT_MAP={'全部':'','国际赛事':'international','国内赛事':'national','当地赛事':'local'}
Page({
  data:{sport:'badminton',heroGrad:GRAD_B,cats:['全部','国际赛事','国内赛事','当地赛事'],activeCat:'全部',list:[],loading:true},
  onLoad(opts){
    
    const sport=opts.sport||wx.getStorageSync('activeSport')||'badminton'
    this.setData({sport,heroGrad:gradOf(sport)})
    this._load()
  },
  _load(){
    this.setData({loading:true})
    const cat=CAT_MAP[this.data.activeCat]||''
    let qs=`?sport=${this.data.sport}`
    if(cat)qs+=`&category=${cat}`
    api.news(qs).then(res=>{
      const d=res.data.data||res.data||[]
      this.setData({list:Array.isArray(d)?d:[],loading:false})
    }).catch(()=>this.setData({list:[],loading:false}))
  },
  setCat(e){
    this.setData({activeCat:e.currentTarget.dataset.cat})
    this._load()
  },
  navigateBack(){wx.navigateBack()},
  goDetail(e){wx.navigateTo({url:'/pages/news/detail/index?id='+e.currentTarget.dataset.id})},
})

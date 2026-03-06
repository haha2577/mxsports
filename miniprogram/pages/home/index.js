const { api } = require('../../utils/api')
const GRAD_B = 'linear-gradient(145deg,#0a7a38,#1DB954,#25d366)'
const GRAD_T = 'linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
Page({
  data:{token:'',sportPref:'',activeSport:'badminton',heroGrad:GRAD_B,nickname:'',matches:[],sbh:20,showLogin:false,showSportPref:false},
  onLoad(){
    try{this.setData({sbh:wx.getSystemInfoSync().statusBarHeight||20})}catch(e){}
  },
  onShow(){
    const token=getApp().globalData.token||''
    const user=getApp().globalData.userInfo||null
    const pref=wx.getStorageSync('sportPref')||''
    const sport=pref==='both'?(wx.getStorageSync('activeSport')||'badminton'):(pref||'badminton')
    this.setData({token,nickname:user?user.nickname||'运动员':'运动员',sportPref:pref,activeSport:sport,heroGrad:sport==='badminton'?GRAD_B:GRAD_T})
    if(token){
      if(!pref){this.setData({showSportPref:true});return}
      this._loadData(sport)
    }
  },
  async _loadData(sport){
    try{
      const r=await api.matches(`?status=open&sport=${sport}&size=3`)
      const list=(r.data.data&&r.data.data.list)||r.data.data||[]
      this.setData({matches:list.slice(0,3)})
    }catch(e){ this.setData({matches:[]}) }
  },
  onSwitchSport(e){
    const sport=e.detail
    wx.setStorageSync('activeSport',sport)
    this.setData({activeSport:sport,heroGrad:sport==='badminton'?GRAD_B:GRAD_T})
    this._loadData(sport)
  },
  onSportPrefConfirm(e){
    const pref=e.detail
    const sport=pref==='both'?'badminton':pref
    wx.setStorageSync('activeSport',sport)
    this.setData({showSportPref:false,sportPref:pref,activeSport:sport,heroGrad:sport==='badminton'?GRAD_B:GRAD_T})
    this._loadData(sport)
  },
  showLoginSheet(){this.setData({showLogin:true})},
  hideLogin(){this.setData({showLogin:false})},
  onLoginSuccess(e){
    const user=e.detail
    const token=getApp().globalData.token||''
    const pref=wx.getStorageSync('sportPref')||''
    this.setData({token,nickname:user?user.nickname||'运动员':'运动员',sportPref:pref,showLogin:false})
    if(!pref)this.setData({showSportPref:true})
    else this._loadData(this.data.activeSport)
  },
  guestBadminton(){wx.navigateTo({url:'/pages/match/list/index?sport=badminton'})},
  guestTennis(){wx.navigateTo({url:'/pages/match/list/index?sport=tennis'})},
  goCreate(){wx.navigateTo({url:'/pages/match/create/index'})},
  goVenue(){wx.navigateTo({url:'/pages/venue/list/index?sport='+this.data.activeSport})},
  goNews(){wx.navigateTo({url:'/pages/news/list/index?sport='+this.data.activeSport})},
  goMatchList(){wx.navigateTo({url:'/pages/match/list/index?sport='+this.data.activeSport})},
  goMatchDetail(e){wx.navigateTo({url:'/pages/match/detail/index?id='+e.currentTarget.dataset.id})},
})
const { GRAD_B, GRAD_T, gradOf, readSport, switchSport } = require('../utils/theme')
const { api } = require('../../utils/api')
Page({
  data:{token:'',sportPref:'',activeSport:'badminton',heroGrad:GRAD_B,nickname:'',matches:[],ongoingMatches:[],showLogin:false,showSportPref:false},
  onLoad(){
    
  },
  onShow(){
    const token=getApp().globalData.token||''
    const user=getApp().globalData.userInfo||null
    const pref=wx.getStorageSync('sportPref')||''
    const sport=pref==='both'?(wx.getStorageSync('activeSport')||'badminton'):(pref||'badminton')
    this.setData({token,nickname:user?user.nickname||'运动员':'运动员',sportPref:pref,activeSport:sport,heroGrad:gradOf(sport)})
    if(token){
      if(!pref){this.setData({showSportPref:true});return}
      this._loadData(sport)
    }
  },
  async _loadData(sport){
    try{
      const [r1, r2, r3] = await Promise.allSettled([
        api.matches(`?status=open&sport=${sport}&size=3`),
        api.myMatches(),
        api.myRegs(),
      ])
      // 附近约球
      const list = r1.status==='fulfilled' ? ((r1.value.data.data&&r1.value.data.data.list)||r1.value.data.data||[]) : []
      this.setData({matches: list.slice(0,3)})
      // 进行中活动（我创建的 + 我报名的，状态 ongoing）
      const mine  = r2.status==='fulfilled' ? (r2.value.data.data||[]) : []
      const regs  = r3.status==='fulfilled' ? (r3.value.data.data||[]) : []
      const ongoingIds = new Set()
      const ongoing = []
      const push = (m, role) => {
        if(m.status==='ongoing' && !ongoingIds.has(m.id)){
          ongoingIds.add(m.id)
          ongoing.push({...m, role})
        }
      }
      mine.forEach(m => push(m, 'organizer'))
      regs.forEach(r => push(r, 'player'))
      this.setData({ongoingMatches: ongoing})
    }catch(e){ this.setData({matches:[], ongoingMatches:[]}) }
  },
  onSwitchSport(e){
    const sport=e.detail
    wx.setStorageSync('activeSport',sport)
    this.setData({activeSport:sport,heroGrad:gradOf(sport)})
    this._loadData(sport)
  },
  onSportPrefConfirm(e){
    const pref=e.detail
    const sport=pref==='both'?'badminton':pref
    wx.setStorageSync('activeSport',sport)
    this.setData({showSportPref:false,sportPref:pref,activeSport:sport,heroGrad:gradOf(sport)})
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
  goActivities(){wx.navigateTo({url:'/pages/my/activities/index'})},
  guestBadminton(){wx.navigateTo({url:'/pages/match/list/index?sport=badminton'})},
  guestTennis(){wx.navigateTo({url:'/pages/match/list/index?sport=tennis'})},
  goCreate(){wx.navigateTo({url:'/pages/match/create/index'})},
  goVenue(){wx.navigateTo({url:'/pages/venue/list/index?sport='+this.data.activeSport})},
  goNews(){wx.navigateTo({url:'/pages/news/list/index?sport='+this.data.activeSport})},
  goMatchList(){wx.navigateTo({url:'/pages/match/list/index?sport='+this.data.activeSport})},
  goMatchDetail(e){wx.navigateTo({url:'/pages/match/detail/index?id='+e.currentTarget.dataset.id})},
})
const GRAD_B = 'linear-gradient(145deg,#0a7a38,#1DB954,#25d366)'
const GRAD_T = 'linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
Page({
  data:{token:'',sportPref:'',activeSport:'badminton',heroGrad:GRAD_B,nickname:'',phone:'',stats:{matches:0,wins:0,rate:'0%',points:0},prefLabel:'',showLogin:false,showSportPref:false,sbh:20,version:''},
  onLoad(){
    try{this.setData({sbh:wx.getSystemInfoSync().statusBarHeight||20})}catch(e){}
    // 优先从 version.json 读取，预览版也能正确显示
    try{
      const vj=require('../../version.json')
      if(vj&&vj.versionName)this.setData({version:vj.versionName})
    }catch(e){
      const v=wx.getAccountInfoSync&&wx.getAccountInfoSync()
      if(v&&v.miniProgram&&v.miniProgram.version)this.setData({version:v.miniProgram.version})
    }
  },
  onShow(){
    const token=getApp().globalData.token||''
    const user=getApp().globalData.userInfo||null
    const pref=wx.getStorageSync('sportPref')||''
    const sport=pref==='both'?(wx.getStorageSync('activeSport')||'badminton'):(pref||'badminton')
    const prefLabel={badminton:'🏸 羽毛球',tennis:'🎾 网球',both:'🏸🎾 双栖'}[pref]||'未设置'
    this.setData({token,nickname:user?user.nickname||'运动员':'运动员',phone:user?user.phone||'':'',sportPref:pref,activeSport:sport,heroGrad:sport==='badminton'?GRAD_B:GRAD_T,prefLabel})
  },
  onSwitchSport(e){
    const sport=e.detail
    wx.setStorageSync('activeSport',sport)
    this.setData({activeSport:sport,heroGrad:sport==='badminton'?GRAD_B:GRAD_T})
  },
  onSportPrefConfirm(e){
    const pref=e.detail
    const sport=pref==='both'?'badminton':pref
    wx.setStorageSync('activeSport',sport)
    const prefLabel={badminton:'🏸 羽毛球',tennis:'🎾 网球',both:'🏸🎾 双栖'}[pref]||'未设置'
    this.setData({showSportPref:false,sportPref:pref,activeSport:sport,heroGrad:sport==='badminton'?GRAD_B:GRAD_T,prefLabel})
  },
  showLoginSheet(){this.setData({showLogin:true})},
  hideLogin(){this.setData({showLogin:false})},
  showPrefSheet(){this.setData({showSportPref:true})},
  onLoginSuccess(e){
    const user=e.detail
    const token=getApp().globalData.token||''
    const pref=wx.getStorageSync('sportPref')||''
    this.setData({token,nickname:user?user.nickname||'运动员':'运动员',phone:user?user.phone||'':'',showLogin:false})
    if(!pref)this.setData({showSportPref:true})
  },
  goRacket(){wx.navigateTo({url:'/pages/racket/recommend/index'})},
  goActivities(){wx.navigateTo({url:'/pages/my/activities/index'})},
  goVideo(){wx.navigateTo({url:'/pages/video/index/index'})},
  goSettings(){wx.showToast({title:'开发中',icon:'none'})},
  logout(){
    wx.showModal({title:'退出登录',content:'确定要退出吗？',success:res=>{
      if(res.confirm){
        ['token','userInfo','sportPref','activeSport'].forEach(k=>wx.removeStorageSync(k))
        getApp().globalData.token=''
        getApp().globalData.userInfo=null
        this.setData({token:'',sportPref:'',nickname:''})
      }
    }})
  },
})
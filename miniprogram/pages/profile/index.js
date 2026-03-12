const { applySport, switchSport, getSportData } = require('../../utils/sport-config')
const { api } = require('../../utils/api')

const PREF_LABEL = {badminton:'羽毛球', tennis:'网球', both:'双栖'}

Page({
  data:{token:'',canSwitch:false,...getSportData('badminton'),
        nickname:'',phone:'',avatar:'',prefLabel:'未设置',
        stats:{matches:0,wins:0,rate:'0%',points:0},
        showLogin:false,showSportPref:false,version:'',showVideoEntry:false,showRacketEntry:false},

  onLoad(){
    try{
      const fs=wx.getFileSystemManager()
      const vj=JSON.parse(fs.readFileSync('/version.json','utf8'))
      if(vj&&vj.versionName)this.setData({version:vj.versionName})
    }catch(e){}
  },

  onShow(){
    const {showVideoEntry=false, showRacketEntry=false}=getApp().globalData
    const token=wx.getStorageSync('token')||''
    const sport=applySport(this)
    const canSwitch=wx.getStorageSync('canSwitch')||false
    const user=wx.getStorageSync('userInfo')||{}
    this.setData({
      token, canSwitch, showVideoEntry, showRacketEntry,
      nickname:user.nickname||'运动员',
      phone:user.phone||'',
      avatar:user.avatar||'',
    })
    if(token) this._fetchProfile()
  },

  async _fetchProfile(){
    try{
      const r=await api.getProfile()
      const u=r.data.data
      const userInfo=wx.getStorageSync('userInfo')||{}
      Object.assign(userInfo,{
        nickname:u.nickname, phone:u.phone, avatar:u.avatar,
        sportPref:u.sportPref, activeSport:u.activeSport, canSwitch:u.canSwitch
      })
      wx.setStorageSync('userInfo',userInfo)
      wx.setStorageSync('activeSport',u.activeSport||'badminton')
      wx.setStorageSync('canSwitch',u.canSwitch||false)
      getApp().globalData.userInfo=userInfo
      const sportData = getSportData(u.activeSport||'badminton')
      this.setData({
        nickname:u.nickname, phone:u.phone||'', avatar:u.avatar||'',
        prefLabel:PREF_LABEL[u.sportPref]||'未设置',
        canSwitch:u.canSwitch||false,
        ...sportData,
      })
    }catch(e){}
  },

  onSwitchSport(e){
    switchSport(this, e, (sport) => {
      api.updateActiveSport(sport).catch(()=>{})
    })
  },

  onSportPrefConfirm(e){
    const {pref, activeSport, canSwitch}=e.detail
    const prefLabel=PREF_LABEL[pref]||'未设置'
    this.setData({showSportPref:false, canSwitch, prefLabel, ...getSportData(activeSport)})
  },

  showLoginSheet(){this.setData({showLogin:true})},
  hideLogin(){this.setData({showLogin:false})},
  showPrefSheet(){this._requireLogin(()=>this.setData({showSportPref:true}))},
  hidePrefSheet(){this.setData({showSportPref:false})},

  onLoginSuccess(e){
    const user=e.detail||{}
    const sport=wx.getStorageSync('activeSport')||'badminton'
    const canSwitch=wx.getStorageSync('canSwitch')||false
    this.setData({
      token:wx.getStorageSync('token'),
      nickname:user.nickname||'运动员',
      phone:user.phone||'',
      avatar:user.avatar||'',
      canSwitch, ...getSportData(sport), showLogin:false
    })
    if(!user.sportPref) this.setData({showSportPref:true})
    else this._fetchProfile()
  },

  onStatsTap(){this._requireLogin(()=>{})},
  _requireLogin(fn){
    if(!this.data.token){this.setData({showLogin:true});return}
    fn()
  },
  goRacket(){this._requireLogin(()=>wx.navigateTo({url:'/pages/racket/recommend/index'}))},
  goAccount(){this._requireLogin(()=>wx.navigateTo({url:'/pages/my/account/index'}))},
  goActivities(){this._requireLogin(()=>wx.navigateTo({url:'/pages/my/activities/index'}))},
  goFriends(){this._requireLogin(()=>wx.navigateTo({url:'/pages/my/friends/index'}))},
  goVideo(){this._requireLogin(()=>wx.navigateTo({url:'/pages/video/index/index'}))},

  logout(){
    wx.showModal({title:'退出登录',content:'确定要退出吗？',success:res=>{
      if(res.confirm){
        ['token','userInfo','activeSport','canSwitch'].forEach(k=>wx.removeStorageSync(k))
        getApp().globalData.token=''
        getApp().globalData.userInfo=null
        this.setData({token:'',canSwitch:false,nickname:'',prefLabel:'未设置'})
      }
    }})
  },
})

const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
const { api } = require('../../utils/api')

const PREF_LABEL = {badminton:'🏸 羽毛球', tennis:'🎾 网球', both:'🏸🎾 双栖'}

Page({
  data:{token:'',canSwitch:false,activeSport:'badminton',heroGrad:GRAD_B,
        nickname:'',phone:'',avatar:'',prefLabel:'未设置',
        stats:{matches:0,wins:0,rate:'0%',points:0},
        showLogin:false,showSportPref:false,version:''},

  onLoad(){
    // 读取版本号
    try{
      const fs=wx.getFileSystemManager()
      const vj=JSON.parse(fs.readFileSync('/version.json','utf8'))
      if(vj&&vj.versionName)this.setData({version:vj.versionName})
    }catch(e){}
  },

  onShow(){
    const token=wx.getStorageSync('token')||''
    const sport=wx.getStorageSync('activeSport')||'badminton'
    const canSwitch=wx.getStorageSync('canSwitch')||false
    // 从本地缓存快速渲染
    const user=wx.getStorageSync('userInfo')||{}
    this.setData({
      token, canSwitch, activeSport:sport,
      heroGrad:sport==='tennis'?GRAD_T:GRAD_B,
      nickname:user.nickname||'运动员',
      phone:user.phone||'',
      avatar:user.avatar||'',
    })
    // 从服务端拉取最新数据（个人信息 + 运动偏好）
    if(token) this._fetchProfile()
  },

  async _fetchProfile(){
    try{
      const r=await api.getProfile()
      const u=r.data.data
      // 更新本地缓存
      const userInfo=wx.getStorageSync('userInfo')||{}
      Object.assign(userInfo,{
        nickname:u.nickname, phone:u.phone, avatar:u.avatar,
        sportPref:u.sportPref, activeSport:u.activeSport, canSwitch:u.canSwitch
      })
      wx.setStorageSync('userInfo',userInfo)
      wx.setStorageSync('activeSport',u.activeSport||'badminton')
      wx.setStorageSync('canSwitch',u.canSwitch||false)
      getApp().globalData.userInfo=userInfo
      this.setData({
        nickname:u.nickname, phone:u.phone||'', avatar:u.avatar||'',
        prefLabel:PREF_LABEL[u.sportPref]||'未设置',
        canSwitch:u.canSwitch||false,
        activeSport:u.activeSport||'badminton',
        heroGrad:(u.activeSport||'badminton')==='tennis'?GRAD_T:GRAD_B,
      })
    }catch(e){}
  },

  onSwitchSport(e){
    const sport=e.detail
    wx.setStorageSync('activeSport',sport)
    this.setData({activeSport:sport,heroGrad:sport==='tennis'?GRAD_T:GRAD_B})
    api.updateActiveSport(sport).catch(()=>{})
  },

  onSportPrefConfirm(e){
    const {pref, activeSport, canSwitch}=e.detail
    const prefLabel=PREF_LABEL[pref]||'未设置'
    this.setData({showSportPref:false, canSwitch, activeSport, heroGrad:activeSport==='tennis'?GRAD_T:GRAD_B, prefLabel})
  },

  showLoginSheet(){this.setData({showLogin:true})},
  hideLogin(){this.setData({showLogin:false})},
  showPrefSheet(){this.setData({showSportPref:true})},

  onLoginSuccess(e){
    const user=e.detail||{}
    const sport=wx.getStorageSync('activeSport')||'badminton'
    const canSwitch=wx.getStorageSync('canSwitch')||false
    this.setData({
      token:wx.getStorageSync('token'),
      nickname:user.nickname||'运动员',
      phone:user.phone||'',
      avatar:user.avatar||'',
      canSwitch, activeSport:sport,
      heroGrad:sport==='tennis'?GRAD_T:GRAD_B,
      showLogin:false
    })
    if(!user.sportPref) this.setData({showSportPref:true})
    else this._fetchProfile()
  },

  goRacket(){wx.navigateTo({url:'/pages/racket/recommend/index'})},
  goAccount(){wx.navigateTo({url:'/pages/my/account/index'})},
  goActivities(){wx.navigateTo({url:'/pages/my/activities/index'})},
  goFriends(){wx.navigateTo({url:'/pages/my/friends/index'})},
  goVideo(){wx.navigateTo({url:'/pages/video/index/index'})},

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

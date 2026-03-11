const { applySport, switchSport, getSportData } = require('../../utils/sport-config')
const { api } = require('../../utils/api')
const { fmtTime } = require('../../utils/time')
Page({
  data:{token:'',canSwitch:false,...getSportData('badminton'),nickname:'',matches:[],ongoingMatches:[],showLogin:false,showSportPref:false},
  onLoad(){
    this._refresh()
  },
  onShow(){
    applySport(this)
    this._refresh()
  },
  _refresh(){
    const token=wx.getStorageSync('token')
    const user=wx.getStorageSync('userInfo')||{}
    const sport=applySport(this)
    const canSwitch=wx.getStorageSync('canSwitch')||false
    this.setData({token,nickname:user.nickname||'运动员',canSwitch})
    if(token){
      if(!user.sportPref){this.setData({showSportPref:true});return}
      this._loadData(sport)
    }
  },
  async _loadData(sport){
    try{
      const sq=`?sport=${sport}`
      const [r1, r2, r3] = await Promise.allSettled([
        api.matches(`?status=open&sport=${sport}&size=3`),
        api.myMatches(sq),
        api.myRegs(sq),
      ])
      const list = r1.status==='fulfilled' ? ((r1.value.data.data&&r1.value.data.data.list)||r1.value.data.data||[]) : []
      this.setData({matches: list.slice(0,3).map(m=>({...m,startTime:fmtTime(m.startTime)}))})
      const mine  = r2.status==='fulfilled' ? (r2.value.data.data||[]) : []
      const regs  = r3.status==='fulfilled' ? (r3.value.data.data||[]) : []
      const ongoingIds = new Set()
      const ongoing = []
      const push = (m, role) => {
        if(m.status==='ongoing' && !ongoingIds.has(m.id)){
          ongoingIds.add(m.id)
          ongoing.push({...m, role, startTime:fmtTime(m.startTime)})
        }
      }
      mine.forEach(m => push(m, 'organizer'))
      regs.forEach(r => push(r, 'player'))
      this.setData({ongoingMatches: ongoing})
    }catch(e){ this.setData({matches:[], ongoingMatches:[]}) }
  },
  onSwitchSport(e){
    switchSport(this, e, (sport) => {
      this._loadData(sport)
      api.updateActiveSport(sport).catch(()=>{})
    })
  },
  onSportPrefConfirm(e){
    const {pref, activeSport, canSwitch}=e.detail
    this.setData({showSportPref:false, canSwitch, ...getSportData(activeSport)})
    this._loadData(activeSport)
  },
  showLoginSheet(){this.setData({showLogin:true})},
  hideLogin(){this.setData({showLogin:false})},
  onLoginSuccess(e){
    const user=e.detail||{}
    const sport=wx.getStorageSync('activeSport')||'badminton'
    const canSwitch=wx.getStorageSync('canSwitch')||false
    this.setData({token:wx.getStorageSync('token'),nickname:user.nickname||'运动员',canSwitch,...getSportData(sport),showLogin:false})
    if(!user.sportPref) this.setData({showSportPref:true})
    else this._loadData(sport)
  },
  guestBadminton(){wx.setStorageSync('activeSport','badminton');this.setData({showLogin:true})},
  guestTennis(){wx.setStorageSync('activeSport','tennis');this.setData({showLogin:true})},
  goCreate(){wx.navigateTo({url:'/pages/match/create/index'})},
  goMatchList(){wx.navigateTo({url:'/pages/match/list/index'})},
  goMatchDetail(e){wx.navigateTo({url:`/pages/match/detail/index?id=${e.currentTarget.dataset.id}`})},
  goVenue(){wx.navigateTo({url:'/pages/venue/list/index'})},
  goNews(){wx.navigateTo({url:'/pages/news/list/index'})},
  goActivities(){wx.navigateTo({url:'/pages/my/activities/index'})},
})

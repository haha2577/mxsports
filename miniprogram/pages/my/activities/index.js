const { MY_ACTIVITIES } = require('../../../store/mockData')
const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
Page({
  data:{sport:'badminton',sportPref:'',heroGrad:GRAD_B,activeTab:'all',tabs:[{label:'全部',value:'all'},{label:'进行中',value:'ongoing'},{label:'已完成',value:'done'}],list:[],filteredList:[],counts:{}},
  onLoad(){
    const sport=wx.getStorageSync('activeSport')||'badminton'
    const pref=wx.getStorageSync('sportPref')||''
    this.setData({sport,sportPref:pref,heroGrad:sport==='badminton'?GRAD_B:GRAD_T})
    this._load(sport)
  },
  _load(sport){
    const list=MY_ACTIVITIES[sport]||[]
    this.setData({list})
    this._filter()
  },
  _filter(){
    const {list,activeTab,sport}=this.data
    const f=list.filter(m=>{
      const tok=activeTab==='all'?true:activeTab==='ongoing'?['open','ongoing'].includes(m.status):m.status==='done'
      return tok
    })
    const counts={}
    ;['all','ongoing','done'].forEach(t=>{counts[t]=list.filter(m=>t==='all'?true:t==='ongoing'?['open','ongoing'].includes(m.status):m.status==='done').length})
    this.setData({filteredList:f,counts})
  },
  onSwitchSport(e){const s=e.detail;wx.setStorageSync('activeSport',s);this.setData({sport:s,heroGrad:s==='badminton'?GRAD_B:GRAD_T});this._load(s)},
  setTab(e){this.setData({activeTab:e.currentTarget.dataset.v});this._filter()},
  goDetail(e){wx.navigateTo({url:'/pages/match/detail?id='+e.currentTarget.dataset.id})},
  goReview(){wx.showToast({title:'评价功能开发中',icon:'none'})},
})
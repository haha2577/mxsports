const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
const { api } = require('../../../utils/api')
const { fmtTime } = require('../../../utils/time')
Page({
  data:{sport:'badminton',heroGrad:GRAD_B,activeTab:'all',tabs:[{label:'全部',value:'all'},{label:'进行中',value:'ongoing'},{label:'已完成',value:'done'}],list:[],filteredList:[],counts:{},loading:false},
  onLoad(){
    const sport=wx.getStorageSync('activeSport')||'badminton'
    this.setData({sport,heroGrad:sport==='tennis'?GRAD_T:GRAD_B})
    this._load()
  },
  onShow(){
    // 每次显示时重新读 activeSport（首页切换后回来要更新）
    const sport=wx.getStorageSync('activeSport')||'badminton'
    this.setData({sport,heroGrad:sport==='tennis'?GRAD_T:GRAD_B})
    this._load()
  },
  async _load(){
    const token=wx.getStorageSync('token')
    if(!token){this.setData({list:[],filteredList:[],counts:{all:0,ongoing:0,done:0}});return}
    this.setData({loading:true})
    try{
      const sport=this.data.sport
      const qs=sport?`?sport=${sport}`:''
      // 同时拉：我创建的 + 我报名的（按当前运动过滤）
      const [mineRes, regsRes] = await Promise.all([
        api.myMatches(qs).catch(()=>null),
        api.myRegs(qs).catch(()=>null),
      ])
      // 我创建的活动
      const created = ((mineRes&&mineRes.data&&mineRes.data.data)||[]).map(m=>({...m,role:'organizer'}))
      // 我报名的活动（去掉已在 created 里的）
      const createdIds = new Set(created.map(m=>m.id))
      const regs = ((regsRes&&regsRes.data&&regsRes.data.data)||[]).filter(r=>!createdIds.has(r.id)).map(r=>({...r,role:'participant'}))
      const list=[...created,...regs].map(m=>({...m,startTime:fmtTime(m.startTime)}))
      this.setData({list})
      this._filter()
    }catch(e){
      wx.showToast({title:'加载失败',icon:'none'})
    }finally{
      this.setData({loading:false})
    }
  },
  _filter(){
    const{list,activeTab}=this.data
    const f=list.filter(m=>{
      if(activeTab==='all') return true
      if(activeTab==='ongoing') return['open','ongoing'].includes(m.status)
      return m.status==='done'||m.status==='finished'
    })
    const counts={
      all:list.length,
      ongoing:list.filter(m=>['open','ongoing'].includes(m.status)).length,
      done:list.filter(m=>m.status==='done'||m.status==='finished').length}
    this.setData({filteredList:f,counts})
  },
  onSwitchSport(e){const s=e.detail;wx.setStorageSync('activeSport',s);this.setData({sport:s,heroGrad:s==='tennis'?GRAD_T:GRAD_B})},
  setTab(e){this.setData({activeTab:e.currentTarget.dataset.v});this._filter()},
  navigateBack(){wx.navigateBack()},
  goDetail(e){wx.navigateTo({url:'/pages/match/detail/index?id='+e.currentTarget.dataset.id})},
  goCreate(){wx.navigateTo({url:'/pages/match/create/index'})},
})

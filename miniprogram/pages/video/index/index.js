const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
Page({
  data:{activeSport:'badminton',sportPref:'',heroGrad:GRAD_B,videos:[{id:1,title:'周末羽毛球双打',sport:'badminton',duration:'1:23:45',date:'03-02',status:'done',progress:100},{id:2,title:'网球训练赛',sport:'tennis',duration:'0:45:00',date:'03-01',status:'processing',progress:65}]},
  navigateBack(){wx.navigateBack()},
  onLoad(){
    
    const sport=wx.getStorageSync('activeSport')||'badminton'
    const pref=wx.getStorageSync('sportPref')||''
    this.setData({activeSport:sport,sportPref:pref,heroGrad:sport==='tennis'?GRAD_T:GRAD_B})
  },
  get videos(){return(this.data.videos||[]).filter(v=>v.sport===this.data.activeSport)},
  onSwitchSport(e){const s=e.detail;wx.setStorageSync('activeSport',s);this.setData({activeSport:s,heroGrad:s==='tennis'?GRAD_T:GRAD_B})},
  chooseVideo(){wx.chooseVideo({sourceType:['album','camera'],maxDuration:7200,success:()=>wx.showToast({title:'上传功能开发中',icon:'none'})})},
  openVideo(){wx.showToast({title:'播放功能开发中',icon:'none'})},
  doClip(){wx.showToast({title:'智能剪辑开发中',icon:'none'})},
  doEval(){wx.showToast({title:'AI评价开发中',icon:'none'})},
  doShare(){wx.showToast({title:'分享功能开发中',icon:'none'})},
})
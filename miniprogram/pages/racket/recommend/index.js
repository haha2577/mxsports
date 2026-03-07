const { GRAD_B, GRAD_T, gradOf, readSport, switchSport } = require('../../utils/theme')
const RACKETS={badminton:[{id:1,name:'尤尼克斯 Astrox 99 Pro',price:1680,level:'高级',tags:['头重','进攻型','碳纤维']},{id:2,name:'李宁 N90 III',price:980,level:'中级',tags:['均衡型','全碳素','轻量']},{id:3,name:'胜利 Thruster K 1',price:760,level:'业余',tags:['头轻','防守型','弹性好']}],tennis:[{id:4,name:'Wilson Pro Staff RF97',price:2200,level:'高级',tags:['控制型','重拍','精准']},{id:5,name:'Head Gravity MP',price:1500,level:'中级',tags:['均衡型','旋转','舒适']},{id:6,name:'Babolat Pure Drive',price:1380,level:'业余',tags:['力量型','弹性好','进攻']}]}
Page({
  data:{sport:'badminton',sportPref:'',heroGrad:GRAD_B,rackets:[]},
  navigateBack(){wx.navigateBack()},
  onLoad(){
    
    const sport=wx.getStorageSync('activeSport')||'badminton'
    const pref=wx.getStorageSync('sportPref')||''
    this.setData({sport,sportPref:pref,heroGrad:gradOf(sport),rackets:RACKETS[sport]||[]})
  },
  onSwitchSport(e){const s=e.detail;wx.setStorageSync('activeSport',s);this.setData({sport:s,heroGrad:gradOf(s),rackets:RACKETS[s]||[]})},
  startQuiz(){wx.showToast({title:'测评功能开发中',icon:'none'})},
  goDetail(){wx.showToast({title:'详情页开发中',icon:'none'})},
})
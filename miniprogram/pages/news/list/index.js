const { NEWS } = require('../../../store/mockData')
const GRAD_B='linear-gradient(145deg,#0a7a38,#1DB954,#25d366)',GRAD_T='linear-gradient(145deg,#8a3010,#d4541f,#e8712a)'
Page({
  data:{sport:'badminton',heroGrad:GRAD_B,cats:['全部','赛事动态','技术提升','装备测评'],activeCat:'全部',allNews:[],filteredNews:[]},
  onLoad(opts){
    const sport=opts.sport||wx.getStorageSync('activeSport')||'badminton'
    const news=NEWS[sport]||[]
    this.setData({sport,heroGrad:sport==='badminton'?GRAD_B:GRAD_T,allNews:news,filteredNews:news})
  },
  setCat(e){
    const cat=e.currentTarget.dataset.cat
    const filtered=cat==='全部'?this.data.allNews:this.data.allNews.filter(n=>n.cat===cat)
    this.setData({activeCat:cat,filteredNews:filtered})
  },
  goDetail(e){wx.navigateTo({url:'/pages/news/detail?id='+e.currentTarget.dataset.id})},
})
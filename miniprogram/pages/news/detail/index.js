const { applySport, getSportData } = require('../../../utils/sport-config')
const{api}=require('../../../utils/api')
Page({
  data:{...getSportData("badminton"),news:null,loading:true,navTitle:'资讯详情'},
  onLoad(opts){
    applySport(this)
    if(opts.id)this._load(opts.id)
  },
  navigateBack(){wx.navigateBack()},
  async _load(id){
    try{
      const r=await api.newsDetail(id)
      this.setData({news:r.data.data,loading:false,navTitle:r.data.data.title||'资讯详情'})
    }catch(e){
      this.setData({loading:false})
      wx.showToast({title:'加载失败',icon:'none'})
    }
  },
  openSource(){
    const url=this.data.news&&this.data.news.sourceUrl
    if(url)wx.setClipboardData({data:url,success:()=>wx.showToast({title:'链接已复制',icon:'success'})})
  },
  onShareAppMessage(){
    const n=this.data.news
    return{title:n?n.title:'体育资讯',path:`/pages/news/detail/index?id=${n?n.id:0}`}
  }
})

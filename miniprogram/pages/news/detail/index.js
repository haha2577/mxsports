const { GRAD_B, GRAD_T, gradOf, readSport, switchSport } = require('../../../utils/theme')
const{api}=require('../../../utils/api')
Page({
  data:{heroGrad:GRAD_B,news:null,loading:true},
  onLoad(opts){
    this.setData(readSport())
    if(opts.id)this._load(opts.id)
  },
  navigateBack(){wx.navigateBack()},
  async _load(id){
    try{
      const r=await api.newsDetail(id)
      this.setData({news:r.data.data,loading:false})
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

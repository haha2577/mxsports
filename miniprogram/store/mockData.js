const MATCHES = {
  badminton: [
    { id:1, name:'周末羽毛球双打约战', sport:'badminton', location:'朝阳体育馆',   distance:'1.2km', date:'3月8日(周六)', time:'09:00-11:00', level:'业余', joined:3, maxPlayers:8, fee:30, status:'open', organizer:'王小明' },
    { id:2, name:'羽毛球单打交流赛',   sport:'badminton', location:'国贸体育中心', distance:'2.4km', date:'3月9日(周日)', time:'14:00-17:00', level:'中级', joined:5, maxPlayers:6, fee:0,  status:'open', organizer:'李强' },
    { id:3, name:'公司内部羽毛球赛',   sport:'badminton', location:'亚运村球馆',   distance:'3.1km', date:'3月6日(周四)', time:'19:00-21:00', level:'不限', joined:6, maxPlayers:6, fee:20, status:'full', organizer:'张伟' },
  ],
  tennis: [
    { id:4, name:'网球双打约球',       sport:'tennis', location:'海淀网球中心', distance:'2.8km', date:'3月7日(周五)', time:'08:00-10:00', level:'中级', joined:2, maxPlayers:4, fee:50, status:'open', organizer:'陈梅' },
    { id:5, name:'网球初学者训练营',   sport:'tennis', location:'望京网球馆',   distance:'3.1km', date:'3月8日(周六)', time:'10:00-12:00', level:'入门', joined:1, maxPlayers:6, fee:20, status:'open', organizer:'刘洋' },
    { id:6, name:'精英网球单打对抗赛', sport:'tennis', location:'国贸网球中心', distance:'4.0km', date:'3月9日(周日)', time:'15:00-18:00', level:'高级', joined:4, maxPlayers:4, fee:80, status:'full', organizer:'王芳' },
  ],
}
const VENUES = {
  badminton: [
    { id:1, name:'朝阳体育馆羽毛球场', address:'朝阳区朝阳路88号',    distance:'1.2km', priceFrom:60,  rating:4.8, reviewCount:234, isOpen:true,  tags:['室内','空调','停车场'] },
    { id:2, name:'亚运村羽毛球馆',     address:'朝阳区北辰路2号',    distance:'3.1km', priceFrom:80,  rating:4.7, reviewCount:98,  isOpen:true,  tags:['专业场地','更衣室'] },
    { id:3, name:'海淀体育馆',         address:'海淀区中关村大街1号', distance:'3.4km', priceFrom:50,  rating:4.6, reviewCount:312, isOpen:false, tags:['室内','空调'] },
  ],
  tennis: [
    { id:4, name:'国贸网球中心',   address:'朝阳区建国路1号',   distance:'2.1km', priceFrom:120, rating:4.9, reviewCount:189, isOpen:true,  tags:['专业场地','灯光场'] },
    { id:5, name:'望京网球馆',     address:'朝阳区望京街18号',  distance:'3.1km', priceFrom:80,  rating:4.7, reviewCount:143, isOpen:true,  tags:['室内','停车场'] },
    { id:6, name:'海淀网球俱乐部', address:'海淀区颐和园路5号', distance:'4.2km', priceFrom:100, rating:4.6, reviewCount:87,  isOpen:false, tags:['室外','灯光场'] },
  ],
}
const NEWS = {
  badminton: [
    { id:1, title:'2025羽超联赛报名通道正式开放', cat:'赛事动态', catColor:'#1DB954', date:'03-04' },
    { id:2, title:'羽毛球双打站位战术详解',       cat:'技术提升', catColor:'#1565c0', date:'03-03' },
    { id:3, title:'2025春季羽毛球拍横向测评',     cat:'装备测评', catColor:'#f57c00', date:'03-02' },
    { id:4, title:'本地羽毛球协会周末邀请赛战报', cat:'赛事动态', catColor:'#1DB954', date:'03-01' },
  ],
  tennis: [
    { id:5, title:'ATP大师赛最新积分榜更新',      cat:'赛事动态', catColor:'#1DB954', date:'03-04' },
    { id:6, title:'网球发球速度提升的5个方法',     cat:'技术提升', catColor:'#1565c0', date:'03-03' },
    { id:7, title:'Wilson vs Head 网球拍对比',    cat:'装备测评', catColor:'#f57c00', date:'03-02' },
    { id:8, title:'本地网球协会公开赛圆满落幕',   cat:'赛事动态', catColor:'#1DB954', date:'03-01' },
  ],
}
const MY_ACTIVITIES = {
  badminton: [
    { id:1, name:'周末羽毛球双打约战', sport:'badminton', location:'朝阳体育馆',   date:'3月8日', time:'09:00', status:'open',    role:'participant', joined:3, maxPlayers:8, result:null,  reviewed:false },
    { id:2, name:'羽毛球单打联赛',     sport:'badminton', location:'国贸体育中心', date:'2月22日',time:'18:30', status:'done',    role:'participant', joined:6, maxPlayers:6, result:'win', reviewed:true  },
  ],
  tennis: [
    { id:3, name:'网球精英内部赛', sport:'tennis', location:'海淀网球中心', date:'3月1日', time:'09:00', status:'ongoing', role:'organizer',   joined:4, maxPlayers:4, result:null,  reviewed:false },
    { id:4, name:'网球新手训练赛', sport:'tennis', location:'望京网球馆',   date:'2月15日',time:'10:00', status:'done',    role:'participant', joined:3, maxPlayers:6, result:'lose',reviewed:false },
  ],
}
module.exports = { MATCHES, VENUES, NEWS, MY_ACTIVITIES }

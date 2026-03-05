/**
 * 测试数据中心 - 按运动隔离
 * 所有页面从这里取数据，对接后端时替换为 API 调用即可
 */

// ── 附近约球 ──────────────────────────────
export const MATCHES = {
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

// ── 附近场馆 ──────────────────────────────
export const VENUES = {
  badminton: [
    { id:1, name:'朝阳体育馆羽毛球场', address:'朝阳区朝阳路88号',   distance:'1.2km', priceFrom:60,  rating:4.8, reviewCount:234, isOpen:true,  tags:['室内','空调','停车场','更衣室'] },
    { id:2, name:'亚运村羽毛球馆',     address:'朝阳区北辰路2号',   distance:'3.1km', priceFrom:80,  rating:4.7, reviewCount:98,  isOpen:true,  tags:['专业场地','更衣室','淋浴'] },
    { id:3, name:'海淀体育馆',         address:'海淀区中关村大街1号',distance:'3.4km', priceFrom:50,  rating:4.6, reviewCount:312, isOpen:false, tags:['室内','空调','停车场'] },
    { id:4, name:'望京羽毛球俱乐部',   address:'朝阳区望京街10号',  distance:'3.8km', priceFrom:40,  rating:4.5, reviewCount:156, isOpen:true,  tags:['室外','免费停车','灯光场'] },
  ],
  tennis: [
    { id:5, name:'国贸网球中心',       address:'朝阳区建国路1号',   distance:'2.1km', priceFrom:120, rating:4.9, reviewCount:189, isOpen:true,  tags:['专业场地','灯光场','教练'] },
    { id:6, name:'望京网球馆',         address:'朝阳区望京街18号',  distance:'3.1km', priceFrom:80,  rating:4.7, reviewCount:143, isOpen:true,  tags:['室内','停车场','更衣室'] },
    { id:7, name:'海淀网球俱乐部',     address:'海淀区颐和园路5号', distance:'4.2km', priceFrom:100, rating:4.6, reviewCount:87,  isOpen:false, tags:['室外','灯光场','教练'] },
    { id:8, name:'顺义网球基地',       address:'顺义区天竺路12号',  distance:'8.5km', priceFrom:60,  rating:4.8, reviewCount:201, isOpen:true,  tags:['专业场地','免费停车','更衣室'] },
  ],
}

// ── 最新资讯 ──────────────────────────────
export const NEWS = {
  badminton: [
    { id:1, title:'2025羽超联赛报名通道正式开放，百余支球队报名参赛', cat:'赛事动态', catColor:'#1DB954', date:'03-04' },
    { id:2, title:'羽毛球双打站位战术详解，看完直接上手',              cat:'技术提升', catColor:'#1565c0', date:'03-03' },
    { id:3, title:'2025春季最值得入手的羽毛球拍横向测评',              cat:'装备测评', catColor:'#f57c00', date:'03-02' },
    { id:4, title:'本地羽毛球协会周末邀请赛精彩战报',                  cat:'赛事动态', catColor:'#1DB954', date:'03-01' },
    { id:5, title:'新手必看：如何快速提升羽毛球反应速度',              cat:'技术提升', catColor:'#1565c0', date:'02-28' },
    { id:6, title:'羽毛球鞋选购指南：这3个指标最重要',                 cat:'装备测评', catColor:'#f57c00', date:'02-27' },
  ],
  tennis: [
    { id:7,  title:'ATP大师赛最新积分榜更新，国内选手创历史新高',     cat:'赛事动态', catColor:'#1DB954', date:'03-04' },
    { id:8,  title:'网球发球速度提升的5个实用训练方法',               cat:'技术提升', catColor:'#1565c0', date:'03-03' },
    { id:9,  title:'Wilson vs Head：2025年中端网球拍深度对比',       cat:'装备测评', catColor:'#f57c00', date:'03-02' },
    { id:10, title:'本地网球协会周末公开赛圆满落幕，精彩回顾',        cat:'赛事动态', catColor:'#1DB954', date:'03-01' },
    { id:11, title:'底线对抗技术拆解：如何打出高质量进攻',            cat:'技术提升', catColor:'#1565c0', date:'02-28' },
    { id:12, title:'网球弦线选购全攻略：手感、耐久与控制的取舍',      cat:'装备测评', catColor:'#f57c00', date:'02-27' },
  ],
}

// ── 我的活动 ──────────────────────────────
export const MY_ACTIVITIES = {
  badminton: [
    { id:1, name:'周末羽毛球双打约战', sport:'badminton', location:'朝阳体育馆',   date:'3月8日', time:'09:00', status:'open',    role:'participant', joined:3, maxPlayers:8, result:null,  reviewed:false },
    { id:2, name:'羽毛球单打联赛',     sport:'badminton', location:'国贸体育中心', date:'2月22日',time:'18:30', status:'done',    role:'participant', joined:6, maxPlayers:6, result:'win', reviewed:true  },
  ],
  tennis: [
    { id:3, name:'网球精英内部赛',   sport:'tennis', location:'海淀网球中心', date:'3月1日', time:'09:00', status:'ongoing', role:'organizer',   joined:4, maxPlayers:4, result:null,  reviewed:false },
    { id:4, name:'网球新手训练赛',   sport:'tennis', location:'望京网球馆',   date:'2月15日',time:'10:00', status:'done',    role:'participant', joined:3, maxPlayers:6, result:'lose',reviewed:false },
  ],
}

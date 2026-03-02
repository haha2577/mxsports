const LOCALES = {
  zh: {
    appName: 'MX Sports',
    home: { title: '选择你的运动', badminton: '羽毛球', badmintonDesc: '轻盈快速 · 室内竞技', tennis: '网球', tennisDesc: '力量技巧 · 精英对决', enter: '进入', comingSoon: '更多运动项目即将上线' },
    nav: { home: '首页', profile: '我的' },
    auth: { login: '登录', logout: '退出登录', phone: '手机号', code: '验证码', sendCode: '获取验证码', loginBtn: '登录', autoCreate: '未注册的手机号将自动创建账号', logoutConfirm: '确定要退出吗？', welcome: '登录成功 🎉' },
    match: { register: '赛事报名', organize: '组织比赛', registerDesc: '查看并报名比赛', organizeDesc: '创建你的赛事', latest: '最新赛事', create: '创建赛事', publish: '立即发布', draft: '存为草稿', name: '赛事名称', location: '比赛场地', date: '比赛日期', time: '比赛时间', format: '赛制', maxPlayers: '最大人数', levels: '参赛级别', desc: '简介', noData: '暂无赛事', status: { open: '报名中', ongoing: '进行中', finished: '已结束' }, types: { round_robin: '循环赛', knockout: '淘汰赛', group: '分组赛' } },
    profile: { title: '个人中心', stats: { matches: '参赛场次', wins: '胜场', rate: '胜率' }, myReg: '我的报名', history: '比赛记录', points: '我的积分', langSetting: '语言设置', settings: '账号设置', notLogin: '登录后查看个人信息' },
    lang: { title: '语言设置', follow: '跟随浏览器', zh: '中文', en: 'English', saved: '语言已更新' },
    common: { loading: '加载中...', save: '保存', cancel: '取消', all: '全部', back: '返回', success: '成功', error: '出错了，请重试' },
  },
  en: {
    appName: 'MX Sports',
    home: { title: 'Choose Your Sport', badminton: 'Badminton', badmintonDesc: 'Fast & agile · Indoor', tennis: 'Tennis', tennisDesc: 'Power & skill · Elite', enter: 'Enter', comingSoon: 'More sports coming soon' },
    nav: { home: 'Home', profile: 'Profile' },
    auth: { login: 'Sign In', logout: 'Sign Out', phone: 'Phone', code: 'Code', sendCode: 'Get Code', loginBtn: 'Sign In', autoCreate: 'New number will auto-create an account', logoutConfirm: 'Are you sure you want to sign out?', welcome: 'Welcome! 🎉' },
    match: { register: 'Join Match', organize: 'Organize', registerDesc: 'Browse & sign up', organizeDesc: 'Create your event', latest: 'Latest Matches', create: 'Create Event', publish: 'Publish Now', draft: 'Save Draft', name: 'Event Name', location: 'Venue', date: 'Date', time: 'Time', format: 'Format', maxPlayers: 'Max Players', levels: 'Level', desc: 'Description', noData: 'No matches yet', status: { open: 'Open', ongoing: 'Live', finished: 'Ended' }, types: { round_robin: 'Round Robin', knockout: 'Knockout', group: 'Group Stage' } },
    profile: { title: 'Profile', stats: { matches: 'Matches', wins: 'Wins', rate: 'Win Rate' }, myReg: 'My Registrations', history: 'Match History', points: 'My Points', langSetting: 'Language', settings: 'Settings', notLogin: 'Sign in to view your profile' },
    lang: { title: 'Language', follow: 'Follow Browser', zh: '中文', en: 'English', saved: 'Language updated' },
    common: { loading: 'Loading...', save: 'Save', cancel: 'Cancel', all: 'All', back: 'Back', success: 'Success', error: 'Something went wrong, please retry' },
  }
}

const i18n = {
  getLang() {
    const saved = localStorage.getItem('mx_lang')
    if (saved === 'zh' || saved === 'en') return saved
    return navigator.language?.startsWith('zh') ? 'zh' : 'en'
  },
  setLang(lang) {
    if (lang) localStorage.setItem('mx_lang', lang)
    else localStorage.removeItem('mx_lang')
    window._lang = lang || i18n.getLang()
  },
  t() { return LOCALES[window._lang || i18n.getLang()] || LOCALES.zh }
}
window._lang = i18n.getLang()
window.i18n = i18n

const { createApp, ref, computed, onMounted, reactive, watch } = Vue

// ─── 全局状态 ─────────────────────────
const state = reactive({
  user: JSON.parse(localStorage.getItem('mx_user') || 'null'),
  token: localStorage.getItem('mx_token') || '',
  lang: window.i18n.getLang(),
  route: location.hash.replace('#', '') || '/home',
  routeParams: {}
})

function navigate(path, params={}) {
  state.route = path
  state.routeParams = params
  location.hash = path
  window.scrollTo(0, 0)
}

window.addEventListener('hashchange', () => {
  state.route = location.hash.replace('#', '') || '/home'
})

function t() { return window.i18n.t() }
function isLogin() { return !!state.token && !!state.user }

function logout() {
  if (!confirm(t().auth.logoutConfirm)) return
  state.user = null; state.token = ''
  localStorage.removeItem('mx_token'); localStorage.removeItem('mx_user')
  navigate('/home')
}

function toast(msg, duration=2000) {
  const el = document.createElement('div')
  el.className = 'toast'; el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300) }, duration)
}

// ─── 组件：顶部栏 ─────────────────────
const NavBar = {
  props: ['title', 'back'],
  setup(props) {
    return () => props.back
      ? Vue.h('div', { class: 'back-bar', onClick: () => navigate(props.back) }, [
          Vue.h('span', '‹'),
          Vue.h('span', props.title || t().common.back)
        ])
      : Vue.h('div', { class: 'nav-bar' }, [
          Vue.h('span', { class: 'nav-logo' }, 'MX Sports'),
          Vue.h('span', { class: 'nav-right', onClick: () => navigate('/profile') }, '🙋')
        ])
  }
}

// ─── 组件：底部导航 ─────────────────────
const TabBar = {
  setup() {
    return () => Vue.h('div', { class: 'tab-bar' }, [
      Vue.h('div', { class: ['tab-item', state.route === '/home' || state.route.startsWith('/badminton') || state.route.startsWith('/tennis') ? 'active' : ''], onClick: () => navigate('/home') }, [
        Vue.h('span', { class: 'tab-icon' }, '🏠'),
        Vue.h('span', { class: 'tab-label' }, t().nav.home)
      ]),
      Vue.h('div', { class: ['tab-item', state.route === '/profile' ? 'active' : ''], onClick: () => navigate('/profile') }, [
        Vue.h('span', { class: 'tab-icon' }, '👤'),
        Vue.h('span', { class: 'tab-label' }, t().nav.profile)
      ])
    ])
  }
}

// ─── 页面：首页 ───────────────────────
const HomePage = {
  setup() {
    const user = computed(() => state.user)
    return () => Vue.h('div', [
      Vue.h(NavBar, {}),
      Vue.h('div', { class: 'page-content', style: 'padding: 20px; display:flex; flex-direction:column; gap:20px;' }, [
        Vue.h('div', { style: 'padding: 10px 0 4px' }, [
          Vue.h('div', { style: 'font-size:22px; font-weight:bold; margin-bottom:4px;' },
            `Hi, ${user.value?.nickname || (state.lang === 'en' ? 'Athlete' : '运动员')} 👋`),
          Vue.h('div', { style: 'color:#888; font-size:14px;' }, t().home.title)
        ]),
        // 羽毛球
        Vue.h('div', { class: 'sport-card badminton', onClick: () => navigate('/badminton') }, [
          Vue.h('div', { class: 'bg-deco' }, 'BADMINTON'),
          Vue.h('div', { class: 'sport-content' }, [
            Vue.h('span', { class: 'sport-emoji' }, '🏸'),
            Vue.h('span', { class: 'sport-name' }, t().home.badminton),
            Vue.h('span', { class: 'sport-desc' }, t().home.badmintonDesc),
            Vue.h('div', { class: 'sport-tags' }, [
              Vue.h('span', { class: 's-tag' }, t().match.register),
              Vue.h('span', { class: 's-tag' }, t().match.organize),
            ]),
            Vue.h('div', { class: 'enter-btn' }, [Vue.h('span', t().home.enter + ' →')])
          ]),
          Vue.h('div', { class: 'deco-float', style: 'top:10px;right:16px;font-size:72px;opacity:.18;' }, '🏸')
        ]),
        // 网球
        Vue.h('div', { class: 'sport-card tennis', onClick: () => navigate('/tennis') }, [
          Vue.h('div', { class: 'bg-deco' }, 'TENNIS'),
          Vue.h('div', { class: 'sport-content' }, [
            Vue.h('span', { class: 'sport-emoji' }, '🎾'),
            Vue.h('span', { class: 'sport-name' }, t().home.tennis),
            Vue.h('span', { class: 'sport-desc' }, t().home.tennisDesc),
            Vue.h('div', { class: 'sport-tags' }, [
              Vue.h('span', { class: 's-tag' }, t().match.register),
              Vue.h('span', { class: 's-tag' }, t().match.organize),
            ]),
            Vue.h('div', { class: 'enter-btn' }, [Vue.h('span', t().home.enter + ' →')])
          ]),
          Vue.h('div', { class: 'deco-float', style: 'top:10px;right:16px;font-size:72px;opacity:.18;' }, '🎾')
        ]),
        Vue.h('div', { class: 'version-tag' }, t().home.comingSoon),
      ]),
      Vue.h(TabBar)
    ])
  }
}

// ─── 页面：运动首页（通用）─────────────
const SportPage = {
  props: ['sport'],
  setup(props) {
    const matches = ref([])
    const loading = ref(false)
    const isBadminton = computed(() => props.sport === 'badminton')
    const tSport = computed(() => isBadminton.value ? t().match : t().match)
    const color = computed(() => isBadminton.value ? 'green' : 'orange')
    const emoji = computed(() => isBadminton.value ? '🏸' : '🎾')

    onMounted(async () => {
      loading.value = true
      try { const r = await window.api.matches('?size=5'); matches.value = r.data?.list || [] } catch {}
      loading.value = false
    })

    return () => Vue.h('div', [
      Vue.h('div', { class: `hero-block hero-${color.value}`, style: 'padding-top:56px;' }, [
        Vue.h('h1', `${emoji.value} ${isBadminton.value ? t().home.badminton : t().home.tennis}`),
        Vue.h('p', isBadminton.value ? t().home.badmintonDesc : t().home.tennisDesc),
        Vue.h('div', { class: 'deco-float', style: 'top:10px;right:10px;font-size:80px;opacity:.15;' }, emoji.value)
      ]),
      Vue.h('div', { class: 'page-content', style: 'padding:20px;' }, [
        Vue.h('div', { class: 'action-row', style: 'padding:0; margin-bottom:20px;' }, [
          Vue.h('div', { class: 'action-card', onClick: () => navigate(`/${props.sport}/matches`) }, [
            Vue.h('div', { class: 'action-icon-wrap', style: `background:${isBadminton.value ? '#e8f7ee' : '#fdf0e8'}` }, '📋'),
            Vue.h('div', { class: 'ac-title' }, t().match.register),
            Vue.h('div', { class: 'ac-desc' }, t().match.registerDesc)
          ]),
          Vue.h('div', { class: 'action-card', onClick: () => { if (!isLogin()) { navigate('/login'); return; } navigate(`/${props.sport}/create`) } }, [
            Vue.h('div', { class: 'action-icon-wrap', style: `background:${isBadminton.value ? '#d0f0dc' : '#fde3d0'}` }, '🏆'),
            Vue.h('div', { class: 'ac-title' }, t().match.organize),
            Vue.h('div', { class: 'ac-desc' }, t().match.organizeDesc)
          ])
        ]),
        Vue.h('div', { class: 'card' }, [
          Vue.h('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;' }, [
            Vue.h('span', { style: 'font-size:16px;font-weight:bold;' }, t().match.latest),
            Vue.h('span', { style: `color:${isBadminton.value ? '#1DB954' : '#d4541f'};cursor:pointer;font-size:14px;`, onClick: () => navigate(`/${props.sport}/matches`) }, t().common.all)
          ]),
          loading.value
            ? Vue.h('div', { class: 'empty-tip' }, t().common.loading)
            : matches.value.length === 0
              ? Vue.h('div', { class: 'empty-tip' }, t().match.noData)
              : matches.value.map(m => Vue.h('div', { class: 'match-item', key: m.id, onClick: () => navigate(`/${props.sport}/detail`, { id: m.id }) }, [
                  Vue.h('div', { class: 'mi-icon-wrap', style: `background:${isBadminton.value ? '#e8f7ee' : '#fdf0e8'}` }, emoji.value),
                  Vue.h('div', { class: 'mi-body' }, [
                    Vue.h('span', { class: 'mi-name' }, m.name),
                    Vue.h('span', { class: 'mi-info' }, `📍${m.location || '—'} · ${m.registeredCount}/${m.maxPlayers}`)
                  ]),
                  Vue.h('span', { class: `status-badge status-${m.status}` }, t().match.status[m.status] || m.status)
                ]))
        ])
      ]),
      Vue.h(TabBar)
    ])
  }
}

// ─── 页面：登录 ───────────────────────
const LoginPage = {
  setup() {
    const phone = ref(''); const code = ref(''); const countdown = ref(0); const loading = ref(false)
    let timer = null

    async function sendCode() {
      if (!/^1[3-9]\d{9}$/.test(phone.value)) { toast(state.lang === 'en' ? 'Invalid phone number' : '请输入正确的手机号'); return }
      try {
        const r = await window.api.sendSms(phone.value)
        if (r.code === 0) {
          toast(state.lang === 'en' ? 'Code sent' : '验证码已发送')
          countdown.value = 60
          timer = setInterval(() => { if (--countdown.value <= 0) { clearInterval(timer); countdown.value = 0 } }, 1000)
        }
      } catch(e) { toast(e.message) }
    }

    async function login() {
      if (!phone.value || !code.value) { toast(state.lang === 'en' ? 'Please fill in all fields' : '请填写手机号和验证码'); return }
      loading.value = true
      try {
        const r = await window.api.phoneLogin(phone.value, code.value)
        if (r.code === 0) {
          state.token = r.data.token
          localStorage.setItem('mx_token', r.data.token)
          const pr = await window.api.profile()
          state.user = pr.data
          localStorage.setItem('mx_user', JSON.stringify(pr.data))
          toast(t().auth.welcome)
          setTimeout(() => navigate('/home'), 500)
        }
      } catch(e) { toast(e.message) }
      loading.value = false
    }

    return () => Vue.h('div', [
      Vue.h('div', { class: 'hero-block hero-dark', style: 'padding-top:56px; display:flex; flex-direction:column; align-items:center; text-align:center;' }, [
        Vue.h('div', { style: 'font-size:72px; margin-bottom:16px;' }, '👤'),
        Vue.h('h1', { style: 'font-size:24px;' }, t().auth.login),
        Vue.h('p', { style: 'font-size:14px; margin-top:8px;' }, t().profile.notLogin)
      ]),
      Vue.h('div', { style: 'padding:24px;' }, [
        Vue.h('div', { class: 'card' }, [
          Vue.h('div', { class: 'form-field' }, [
            Vue.h('label', { class: 'form-label' }, t().auth.phone),
            Vue.h('input', { class: 'form-input', type: 'tel', maxlength: '11', placeholder: state.lang === 'en' ? 'Enter phone number' : '请输入手机号', value: phone.value, onInput: e => phone.value = e.target.value })
          ]),
          Vue.h('div', { class: 'form-field' }, [
            Vue.h('label', { class: 'form-label' }, t().auth.code),
            Vue.h('div', { class: 'code-row' }, [
              Vue.h('input', { class: 'form-input', type: 'number', maxlength: '6', placeholder: state.lang === 'en' ? '6-digit code' : '请输入6位验证码', value: code.value, onInput: e => code.value = e.target.value }),
              Vue.h('button', { class: 'btn-send', disabled: countdown.value > 0, onClick: sendCode },
                countdown.value > 0 ? `${countdown.value}s` : t().auth.sendCode)
            ])
          ]),
          Vue.h('button', { class: 'btn btn-primary mt-16', onClick: login, disabled: loading.value },
            loading.value ? t().common.loading : t().auth.loginBtn),
          Vue.h('p', { class: 'form-tip' }, t().auth.autoCreate)
        ])
      ]),
      Vue.h(TabBar)
    ])
  }
}

// ─── 页面：创建比赛 ─────────────────────
const CreatePage = {
  props: ['sport'],
  setup(props) {
    const form = reactive({ name:'', location:'', matchType:'round_robin', maxPlayers:16, levels:[], startDate:'', startTime:'', description:'' })
    const saving = ref(false)
    const types = [
      { v:'round_robin', icon:'🔄', label: () => t().match.types.round_robin },
      { v:'knockout',    icon:'⚡', label: () => t().match.types.knockout },
      { v:'group',       icon:'🏟️', label: () => t().match.types.group }
    ]
    const allLevels = ['A组（高级）','B组（中级）','C组（初级）','混合']
    const isBadminton = props.sport === 'badminton'

    function toggleLevel(lv) {
      const idx = form.levels.indexOf(lv)
      if (idx === -1) form.levels.push(lv); else form.levels.splice(idx, 1)
    }

    async function submit(status) {
      if (!form.name) { toast(t().match.name + '?'); return }
      if (!form.location) { toast(t().match.location + '?'); return }
      saving.value = true
      try {
        const r = await window.api.createMatch({ ...form, status, startTime: form.startDate && form.startTime ? `${form.startDate} ${form.startTime}` : null })
        if (r.code === 0) { toast(status === 'open' ? t().match.publish : t().match.draft); setTimeout(() => navigate(`/${props.sport}`), 600) }
      } catch(e) { toast(e.message) }
      saving.value = false
    }

    const inputStyle = 'width:100%;border:1.5px solid #eee;border-radius:12px;padding:12px 16px;font-size:15px;outline:none;'

    return () => Vue.h('div', [
      Vue.h(NavBar, { title: t().match.create, back: `/${props.sport}` }),
      Vue.h('div', { class: 'page-content', style: 'padding:16px;' }, [
        // 基本信息
        Vue.h('div', { class: 'card' }, [
          Vue.h('div', { class: 'form-section-title' }, t().match.basicInfo || '📋 ' + (state.lang==='en'?'Basic Info':'基本信息')),
          Vue.h('div', { class: 'form-field' }, [
            Vue.h('label', { class: 'form-label' }, t().match.name),
            Vue.h('input', { class: 'form-input', placeholder: state.lang==='en'?'Event name':'输入赛事名称', value: form.name, onInput: e => form.name = e.target.value })
          ]),
          Vue.h('div', { class: 'form-field' }, [
            Vue.h('label', { class: 'form-label' }, t().match.location),
            Vue.h('input', { class: 'form-input', placeholder: state.lang==='en'?'Venue address':'输入场地地址', value: form.location, onInput: e => form.location = e.target.value })
          ]),
          Vue.h('div', { style: 'display:flex;gap:12px;' }, [
            Vue.h('div', { class: 'form-field', style: 'flex:1' }, [
              Vue.h('label', { class: 'form-label' }, t().match.date),
              Vue.h('input', { class: 'form-input', type:'date', value: form.startDate, onChange: e => form.startDate = e.target.value })
            ]),
            Vue.h('div', { class: 'form-field', style: 'flex:1' }, [
              Vue.h('label', { class: 'form-label' }, t().match.time),
              Vue.h('input', { class: 'form-input', type:'time', value: form.startTime, onChange: e => form.startTime = e.target.value })
            ])
          ])
        ]),
        // 赛制
        Vue.h('div', { class: 'card' }, [
          Vue.h('div', { class: 'form-section-title' }, '⚙️ ' + t().match.format),
          Vue.h('div', { class: 'type-grid' }, types.map(tp =>
            Vue.h('div', { class: ['type-card', form.matchType === tp.v ? 'active' : ''], key: tp.v, onClick: () => form.matchType = tp.v }, [
              Vue.h('span', { class: 't-icon' }, tp.icon),
              Vue.h('span', { class: 't-name' }, tp.label()),
            ])
          )),
          Vue.h('div', { class: 'form-field' }, [
            Vue.h('label', { class: 'form-label' }, t().match.maxPlayers),
            Vue.h('div', { class: 'stepper' }, [
              Vue.h('div', { class: 's-btn', onClick: () => form.maxPlayers = Math.max(4, form.maxPlayers - 1) }, '−'),
              Vue.h('div', { class: 's-val' }, form.maxPlayers),
              Vue.h('div', { class: 's-btn', onClick: () => form.maxPlayers = Math.min(64, form.maxPlayers + 1) }, '+')
            ])
          ]),
          Vue.h('div', { class: 'form-field' }, [
            Vue.h('label', { class: 'form-label' }, t().match.levels),
            Vue.h('div', { class: 'chip-list' }, allLevels.map(lv =>
              Vue.h('div', { class: ['chip', form.levels.includes(lv) ? 'active' : ''], key: lv, onClick: () => toggleLevel(lv) }, lv)
            ))
          ])
        ]),
        // 简介
        Vue.h('div', { class: 'card' }, [
          Vue.h('div', { class: 'form-section-title' }, '📝 ' + t().match.desc),
          Vue.h('textarea', { style: inputStyle + 'height:100px;resize:none;', placeholder: state.lang==='en'?'Rules, notes (optional)':'填写赛事规则、注意事项（选填）', value: form.description, onInput: e => form.description = e.target.value })
        ]),
        // 按钮
        Vue.h('div', { style: 'display:flex;gap:12px;' }, [
          Vue.h('button', { class: 'btn btn-outline', style: 'flex:1', onClick: () => submit('draft') }, t().match.draft),
          Vue.h('button', { class: `btn ${isBadminton ? 'btn-green' : 'btn-orange'}`, style: 'flex:2', onClick: () => submit('open') }, t().match.publish)
        ])
      ])
    ])
  }
}

// ─── 页面：个人中心 ─────────────────────
const ProfilePage = {
  setup() {
    return () => {
      if (!isLogin()) return Vue.h('div', [
        Vue.h('div', { class: 'hero-block hero-dark', style: 'padding-top:56px;text-align:center;' }, [
          Vue.h('div', { style: 'font-size:72px;margin-bottom:16px;' }, '👤'),
          Vue.h('h1', t().auth.login),
          Vue.h('p', { style: 'margin-top:8px;' }, t().profile.notLogin)
        ]),
        Vue.h('div', { style: 'padding:20px;' }, [
          Vue.h('button', { class: 'btn btn-primary', onClick: () => navigate('/login') }, t().auth.login)
        ]),
        Vue.h(TabBar)
      ])

      const u = state.user
      return Vue.h('div', [
        Vue.h('div', { class: 'user-header' }, [
          Vue.h('div', { class: 'user-avatar' },
            u.avatar ? [Vue.h('img', { src: u.avatar })] : ['🏅']),
          Vue.h('div', [
            Vue.h('span', { class: 'user-name' }, u.nickname || '运动员'),
            u.phone ? Vue.h('div', { style: 'font-size:13px;color:rgba(255,255,255,.6);margin-bottom:8px;' }, '📱 ' + u.phone) : null,
            Vue.h('span', { class: 'user-level' }, u.level || 'B组（中级）')
          ])
        ]),
        Vue.h('div', { class: 'stats-strip' }, [
          Vue.h('div', { class: 'stat-col' }, [Vue.h('span', { class: 'stat-n' }, '0'), Vue.h('span', { class: 'stat-l' }, t().profile.stats.matches)]),
          Vue.h('div', { class: 'stat-div' }),
          Vue.h('div', { class: 'stat-col' }, [Vue.h('span', { class: 'stat-n' }, '0'), Vue.h('span', { class: 'stat-l' }, t().profile.stats.wins)]),
          Vue.h('div', { class: 'stat-div' }),
          Vue.h('div', { class: 'stat-col' }, [Vue.h('span', { class: 'stat-n' }, '0%'), Vue.h('span', { class: 'stat-l' }, t().profile.stats.rate)]),
        ]),
        Vue.h('div', { class: 'menu-card', style: 'margin-bottom:20px;' }, [
          Vue.h('div', { class: 'menu-item', onClick: () => navigate('/profile/regs') }, [Vue.h('span', { class: 'm-icon' }, '📋'), Vue.h('span', { class: 'm-label' }, t().profile.myReg), Vue.h('span', { class: 'm-arrow' }, '›')]),
          Vue.h('div', { class: 'menu-item' }, [Vue.h('span', { class: 'm-icon' }, '🏆'), Vue.h('span', { class: 'm-label' }, t().profile.history), Vue.h('span', { class: 'm-arrow' }, '›')]),
          Vue.h('div', { class: 'menu-item' }, [Vue.h('span', { class: 'm-icon' }, '⭐'), Vue.h('span', { class: 'm-label' }, t().profile.points), Vue.h('span', { class: 'm-arrow' }, '›')]),
          Vue.h('div', { class: 'menu-item', onClick: () => navigate('/lang') }, [Vue.h('span', { class: 'm-icon' }, '🌐'), Vue.h('span', { class: 'm-label' }, t().profile.langSetting), Vue.h('span', { class: 'm-arrow' }, '›')]),
          Vue.h('div', { class: 'menu-item' }, [Vue.h('span', { class: 'm-icon' }, '⚙️'), Vue.h('span', { class: 'm-label' }, t().profile.settings), Vue.h('span', { class: 'm-arrow' }, '›')]),
        ]),
        Vue.h('div', { style: 'padding:0 16px 16px;' }, [
          Vue.h('button', { class: 'btn btn-danger', onClick: logout }, t().auth.logout)
        ]),
        Vue.h(TabBar)
      ])
    }
  }
}

// ─── 页面：语言设置 ─────────────────────
const LangPage = {
  setup() {
    const current = ref(localStorage.getItem('mx_lang') || '__follow__')
    function select(v) {
      current.value = v
      window.i18n.setLang(v === '__follow__' ? null : v)
      state.lang = window._lang
      toast(t().lang.saved)
      setTimeout(() => navigate('/profile'), 600)
    }
    return () => Vue.h('div', [
      Vue.h(NavBar, { title: t().lang.title, back: '/profile' }),
      Vue.h('div', { style: 'padding:20px;' }, [
        ['__follow__', 'zh', 'en'].map(v =>
          Vue.h('div', { class: 'lang-option', key: v, onClick: () => select(v) }, [
            Vue.h('span', { class: 'lang-label' }, v === '__follow__' ? t().lang.follow : v === 'zh' ? t().lang.zh : t().lang.en),
            current.value === v ? Vue.h('span', { class: 'lang-check' }, '✓') : null
          ])
        )
      ])
    ])
  }
}

// ─── 路由 ─────────────────────────────
const App = {
  setup() {
    return () => {
      const r = state.route
      if (r === '/home')                return Vue.h(HomePage)
      if (r === '/login')               return Vue.h(LoginPage)
      if (r === '/badminton')           return Vue.h(SportPage, { sport: 'badminton' })
      if (r === '/tennis')              return Vue.h(SportPage, { sport: 'tennis' })
      if (r === '/badminton/create')    return Vue.h(CreatePage, { sport: 'badminton' })
      if (r === '/tennis/create')       return Vue.h(CreatePage, { sport: 'tennis' })
      if (r === '/profile')             return Vue.h(ProfilePage)
      if (r === '/lang')                return Vue.h(LangPage)
      return Vue.h(HomePage)
    }
  }
}

createApp(App).mount('#app')

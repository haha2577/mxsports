const { aiChat, resolveUrl } = require('../../utils/api')
const { applySport, getSportData } = require('../../utils/sport-config')
const { mdToNodes } = require('../../utils/markdown')

const QUICK_QUESTIONS = [
  { icon: '🏸', text: '羽毛球基本规则' },
  { icon: '🎾', text: '网球计分方式' },
  { icon: '💪', text: '赛前热身建议' },
  { icon: '🏅', text: '装备选购指南' },
]

Page({
  data: {
    navHeight: 0,
    messages: [],        // [{id, role, content, loading}]
    inputText: '',
    sending: false,
    quickQuestions: QUICK_QUESTIONS,
    scrollId: '',
    // auth
    token: '',
    userAvatar: '',
    showLogin: false,
    // sport theme
    ...getSportData('badminton'),
  },

  _task: null,           // current SSE request task
  _msgIdCounter: 0,

  onLoad() {
    this._refreshAuth()
  },

  onShow() {
    applySport(this)
    this._refreshAuth()
  },

  _refreshAuth() {
    const token = wx.getStorageSync('token')
    const user = wx.getStorageSync('userInfo') || {}
    const avatar = user.avatar ? resolveUrl(user.avatar) : ''
    this.setData({ token, userAvatar: avatar })
  },

  onNavHeight(e) {
    this.setData({ navHeight: e.detail.height })
  },

  showLoginSheet() { this.setData({ showLogin: true }) },
  hideLogin() { this.setData({ showLogin: false }) },
  onLoginSuccess() {
    this._refreshAuth()
    this.setData({ showLogin: false })
  },

  // ---- Input handling ----
  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  onQuickTap(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ inputText: text })
    this.doSend()
  },

  onSend() {
    this.doSend()
  },

  doSend() {
    if (!this.data.token) { this.setData({ showLogin: true }); return }
    const content = (this.data.inputText || '').trim()
    if (!content || this.data.sending) return

    const userMsg = { id: 'msg-' + (++this._msgIdCounter), role: 'user', content }
    const aiMsg = { id: 'msg-' + (++this._msgIdCounter), role: 'assistant', content: '', loading: true, streaming: true, nodes: [] }

    const messages = [...this.data.messages, userMsg, aiMsg]
    this.setData({
      messages,
      inputText: '',
      sending: true,
      scrollId: aiMsg.id,
    })

    // Build conversation history for API
    const apiMessages = messages
      .filter(m => m.role === 'user' || (m.role === 'assistant' && m.content))
      .map(m => ({ role: m.role, content: m.content }))

    const aiMsgIndex = messages.length - 1
    let accumulated = ''

    console.log('[AI页面] 发送消息, aiMsgIndex:', aiMsgIndex, 'apiMessages:', apiMessages.length)

    this._task = aiChat(
      apiMessages,
      // onChunk：流式阶段只更新纯文本，不做 markdown 解析
      (chunk) => {
        accumulated += chunk
        const key = `messages[${aiMsgIndex}].content`
        const loadKey = `messages[${aiMsgIndex}].loading`
        this.setData({
          [key]: accumulated,
          [loadKey]: false,
          scrollId: aiMsg.id,
        })
      },
      // onDone：流结束后一次性解析 markdown
      () => {
        const nodesKey = `messages[${aiMsgIndex}].nodes`
        const loadKey = `messages[${aiMsgIndex}].loading`
        const streamingKey = `messages[${aiMsgIndex}].streaming`
        this.setData({
          [nodesKey]: mdToNodes(accumulated),
          [streamingKey]: false,
          [loadKey]: false,
          sending: false,
        })
        this._task = null
      },
      // onError
      (err) => {
        console.log('[AI页面] onError:', err)
        const text = accumulated || '抱歉，服务暂时不可用，请稍后再试。'
        const key = `messages[${aiMsgIndex}].content`
        const nodesKey = `messages[${aiMsgIndex}].nodes`
        const loadKey = `messages[${aiMsgIndex}].loading`
        const streamingKey = `messages[${aiMsgIndex}].streaming`
        this.setData({
          [key]: text,
          [nodesKey]: mdToNodes(text),
          [streamingKey]: false,
          [loadKey]: false,
          sending: false,
        })
        this._task = null
      }
    )
  },

  onCopyMsg(e) {
    const content = e.currentTarget.dataset.content
    if (!content) return
    wx.setClipboardData({ data: content })
  },

  onClearChat() {
    wx.showModal({
      title: '清空对话',
      content: '确定要清空所有聊天记录吗？',
      success: (res) => {
        if (res.confirm) {
          if (this._task) { this._task.abort(); this._task = null }
          this.setData({ messages: [], sending: false })
        }
      }
    })
  },

  onUnload() {
    if (this._task) { this._task.abort(); this._task = null }
  },
})

const { aiChat } = require('../../utils/api')

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
  },

  _task: null,           // current SSE request task
  _msgIdCounter: 0,

  onLoad() {},

  onNavHeight(e) {
    this.setData({ navHeight: e.detail.height })
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
    const content = (this.data.inputText || '').trim()
    if (!content || this.data.sending) return

    const userMsg = { id: 'msg-' + (++this._msgIdCounter), role: 'user', content }
    const aiMsg = { id: 'msg-' + (++this._msgIdCounter), role: 'assistant', content: '', loading: true }

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

    this._task = aiChat(
      apiMessages,
      // onChunk
      (chunk) => {
        accumulated += chunk
        const key = `messages[${aiMsgIndex}].content`
        const loadKey = `messages[${aiMsgIndex}].loading`
        this.setData({ [key]: accumulated, [loadKey]: false, scrollId: aiMsg.id })
      },
      // onDone
      () => {
        const loadKey = `messages[${aiMsgIndex}].loading`
        this.setData({ [loadKey]: false, sending: false })
        this._task = null
      },
      // onError
      (err) => {
        const key = `messages[${aiMsgIndex}].content`
        const loadKey = `messages[${aiMsgIndex}].loading`
        this.setData({
          [key]: accumulated || '抱歉，服务暂时不可用，请稍后再试。',
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

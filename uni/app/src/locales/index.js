import zh from './zh.js'
import en from './en.js'
const locales = { zh, en }
export function getLang() {
  const saved = uni.getStorageSync('mx_lang')
  if (saved === 'zh' || saved === 'en') return saved
  try { const s = uni.getSystemInfoSync(); return (s.language||'').startsWith('en') ? 'en' : 'zh' } catch { return 'zh' }
}
export function setLang(lang) { lang ? uni.setStorageSync('mx_lang', lang) : uni.removeStorageSync('mx_lang') }
export function t() { return locales[getLang()] || locales.zh }

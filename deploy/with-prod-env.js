/**
 * 上传前将 miniprogram/utils/env.js 切换为生产配置，
 * 上传完成后自动还原（无论成功还是失败）。
 *
 * 用法：
 *   const { withProdEnv } = require('./with-prod-env')
 *   await withProdEnv(async () => {
 *     await ci.upload(...)
 *   })
 */
const fs   = require('fs')
const path = require('path')

const ENV_PATH = path.resolve(__dirname, '../miniprogram/utils/env.js')

const PROD_ENV = `module.exports = {
  API_BASE: 'https://mxsports.vip/api',
  SHOW_VIDEO_ENTRY: false,   // 我的视频
  SHOW_RACKET_ENTRY: false,  // 智能球拍推荐
  SHOW_VENUE_ENTRY: false,   // 附近场馆
}
`

async function withProdEnv(fn) {
  // 读取并备份原始内容（文件可能不存在）
  let original = null
  if (fs.existsSync(ENV_PATH)) {
    original = fs.readFileSync(ENV_PATH, 'utf-8')
  }

  // 写入生产配置
  fs.writeFileSync(ENV_PATH, PROD_ENV, 'utf-8')
  console.log('🔧 env.js → 生产配置')

  try {
    await fn()
  } finally {
    // 还原（或删除）
    if (original !== null) {
      fs.writeFileSync(ENV_PATH, original, 'utf-8')
      console.log('🔧 env.js → 已还原本地配置')
    } else {
      fs.unlinkSync(ENV_PATH)
      console.log('🔧 env.js → 已删除（原本不存在）')
    }
  }
}

module.exports = { withProdEnv }

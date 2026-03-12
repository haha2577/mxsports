/**
 * 上传体验版（不生成二维码，在微信后台设置体验版成员后可扫码）
 * 体验版长期有效，最多15人白名单
 */
require('./load-env')
const ci   = require('miniprogram-ci')
const path = require('path')
const fs   = require('fs')
const { withProdEnv } = require('./with-prod-env')

const APPID        = 'wx686427f3488d40ab'
const ROOT         = path.resolve(__dirname, '..')
const PROJECT_PATH = path.join(ROOT, 'miniprogram')
const KEY_PATH     = path.join(__dirname, 'private.wx686427f3488d40ab.key')
const VERSION_FILE = path.join(PROJECT_PATH, 'version.json')

function getVersion() {
  if (!fs.existsSync(VERSION_FILE)) return '0.0.1'
  const d = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'))
  return d.versionName || '0.0.1'
}

async function main() {
  const version = getVersion()
  console.log('🏸 MX Sports 小程序 - 上传体验版')
  console.log('━'.repeat(40))
  console.log(`📦 版本号: ${version}`)
  console.log('⏭  原生小程序，无需编译构建')

  const project = new ci.Project({
    appid: APPID, type: 'miniProgram', projectPath: PROJECT_PATH,
    privateKeyPath: KEY_PATH, ignores: ['node_modules/**/*'],
  })

  console.log('📤 上传体验版...')
  const t0 = Date.now()

  try {
    await withProdEnv(async () => {
      await ci.upload({
        project,
        version,
        desc: `体验版 ${new Date().toLocaleString('zh-CN')}`,
        setting: { es6: true, minify: true, autoPrefixWXSS: true },
        onProgressUpdate(task) { if (task._msg) process.stdout.write(`\r  ${task._msg}`) },
      })
    })

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
    console.log(`\n✅ 体验版上传成功！耗时 ${elapsed}s`)
    console.log('')
    console.log('📋 后续步骤:')
    console.log('   1. 登录微信公众平台 mp.weixin.qq.com')
    console.log('   2. 版本管理 → 体验版 → 选择刚上传的版本')
    console.log('   3. 体验成员管理 → 添加测试人员微信号')
    console.log('   4. 测试人员扫码即可（长期有效）')

  } catch(err) {
    console.error('\n❌ 上传失败:', err.message || err)
    process.exit(1)
  }
}

main()

require('./load-env')
const ci   = require('miniprogram-ci')
const path = require('path')
const fs   = require('fs')
const https = require('https')
const os    = require('os')
const { withProdEnv } = require('./with-prod-env')

const APPID        = 'wx686427f3488d40ab'
const ROOT         = path.resolve(__dirname, '..')
const PROJECT_PATH = path.join(ROOT, 'miniprogram')
const KEY_PATH     = path.join(__dirname, 'private.wx686427f3488d40ab.key')
const QR_OUTPUT    = path.join(__dirname, 'preview-qrcode.jpg')
const VERSION_FILE = path.join(PROJECT_PATH, 'version.json')
const TG_TOKEN     = process.env.TG_TOKEN || ''
const TG_CHAT      = process.env.TG_CHAT  || ''

function bumpVersion() {
  let data = { versionName: '0.0.1', versionCode: '1' }
  if (fs.existsSync(VERSION_FILE)) {
    data = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'))
  }
  const [major, minor, patch] = (data.versionName || '0.0.1').split('.').map(Number)
  const newName = `${major}.${minor}.${patch + 1}`
  const newCode = String(parseInt(data.versionCode || '1') + 1)
  data.versionName = newName
  data.versionCode = newCode
  fs.writeFileSync(VERSION_FILE, JSON.stringify(data, null, 2))
  console.log(`📦 版本号: ${newName} (code: ${newCode})`)
  return newName
}

function getVersion() {
  if (!fs.existsSync(VERSION_FILE)) return '0.0.1'
  return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8')).versionName || '0.0.1'
}

async function buildMP() {
  console.log('⏭  原生小程序，无需编译构建')
}

async function main() {
  console.log('🏸 MX Sports 小程序 - 自动构建 + 预览')
  console.log('━'.repeat(40))

  const version = bumpVersion()
  await buildMP()

  if (!fs.existsSync(PROJECT_PATH)) { console.error('❌ 构建产物不存在'); process.exit(1) }

  const project = new ci.Project({
    appid: APPID, type: 'miniProgram', projectPath: PROJECT_PATH,
    privateKeyPath: KEY_PATH, ignores: ['node_modules/**/*'],
  })
  console.log('📦 上传预览包...')
  const t0 = Date.now()

  try {
    let r
    await withProdEnv(async () => {
      r = await ci.preview({
        project,
        version,
        desc: `预览 ${new Date().toLocaleString('zh-CN')}`,
        setting: { es6: true, minify: false, autoPrefixWXSS: true },
        qrcodeFormat: 'image',
        qrcodeOutputDest: QR_OUTPUT,
        onProgressUpdate(task) { if (task._msg) process.stdout.write(`\r  ${task._msg}`) },
      })
    })

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
    console.log(`\n✅ 上传成功！耗时 ${elapsed}s`)

    let sizeInfo = ''
    if (r.subPackageInfo) {
      r.subPackageInfo.forEach(pkg => {
        const kb = (pkg.size / 1024).toFixed(1)
        console.log(`   📦 ${pkg.name === '__FULL__' ? '完整包' : pkg.name}: ${kb} KB`)
        if (pkg.name === '__FULL__') sizeInfo = `📦 包大小: ${kb} KB`
      })
    }

    const ws = path.join(os.homedir(), '.openclaw/workspace/preview-qrcode.jpg')
    fs.copyFileSync(QR_OUTPUT, ws)

    if (TG_TOKEN && TG_CHAT) {
      await sendTG(ws, version, elapsed, sizeInfo)
    }
  } catch(err) {
    console.error('\n❌ 预览失败:', err.message || err)
    process.exit(1)
  }
}

function sendTG(imgPath, version, elapsed, sizeInfo) {
  return new Promise((resolve, reject) => {
    const buf      = fs.readFileSync(imgPath)
    const boundary = '----Boundary' + Date.now()
    const caption  = [`🏸 *MX Sports v${version}*`, `🕐 ${new Date().toLocaleString('zh-CN')}`, `⏱ ${elapsed}s`, sizeInfo, '', '扫描二维码体验（24h有效）'].filter(Boolean).join('\n')
    const parts    = [`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${TG_CHAT}`, `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}`, `--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nMarkdown`]
    const header   = Buffer.from(parts.join('\r\n') + `\r\n--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="qr.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`)
    const footer   = Buffer.from(`\r\n--${boundary}--`)
    const body     = Buffer.concat([header, buf, footer])
    const req      = https.request({ hostname:'api.telegram.org', path:`/bot${TG_TOKEN}/sendPhoto`, method:'POST', headers:{ 'Content-Type':`multipart/form-data; boundary=${boundary}`, 'Content-Length':body.length } }, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => { const j=JSON.parse(d); j.ok ? (console.log('📨 已发送到 Telegram'), resolve()) : reject(new Error(j.description)) })
    })
    req.on('error', reject); req.write(body); req.end()
  })
}

main()

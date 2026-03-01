/**
 * 微信小程序自动预览脚本
 * 执行后生成预览二维码，通过 Telegram Bot 发送给你
 *
 * 用法: node deploy/preview.js
 */

require('./load-env')
const ci = require('miniprogram-ci')
const path = require('path')
const fs = require('fs')
const https = require('https')

// ─── 配置 ──────────────────────────────────────────────────
const APPID        = 'wx686427f3488d40ab'
const PROJECT_PATH = path.resolve(__dirname, '../dist/build/mp-weixin')   // UniApp 构建产物
const KEY_PATH     = path.resolve(__dirname, './private.wx686427f3488d40ab.key')
const QR_OUTPUT    = path.resolve(__dirname, './preview-qrcode.jpg')

// Telegram 通知配置（从环境变量读取）
const TG_TOKEN  = process.env.TG_TOKEN  || ''
const TG_CHAT   = process.env.TG_CHAT   || ''

// ─── 主流程 ────────────────────────────────────────────────
async function main() {
  console.log('🏸 羽毛球小程序 - 自动预览')
  console.log('━'.repeat(40))

  // 1. 检查构建产物
  if (!fs.existsSync(PROJECT_PATH)) {
    console.error(`❌ 构建产物不存在: ${PROJECT_PATH}`)
    console.error('   请先执行: npm run build:mp-weixin')
    process.exit(1)
  }

  // 2. 创建 CI 项目对象
  const project = new ci.Project({
    appid:          APPID,
    type:           'miniProgram',
    projectPath:    PROJECT_PATH,
    privateKeyPath: KEY_PATH,
    ignores:        ['node_modules/**/*'],
  })

  // 3. 生成预览二维码
  console.log('📦 正在上传预览包...')
  const startTime = Date.now()

  try {
    const previewResult = await ci.preview({
      project,
      desc:            `预览 ${new Date().toLocaleString('zh-CN')}`,
      setting: {
        es6:      true,
        minify:   false,
        autoPrefixWXSS: true,
      },
      qrcodeFormat:    'image',
      qrcodeOutputDest: QR_OUTPUT,
      onProgressUpdate(task) {
        if (task._msg) process.stdout.write(`\r  ${task._msg}`)
      },
    })

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\n✅ 预览包上传成功！耗时 ${elapsed}s`)

    // 包大小信息
    if (previewResult.subPackageInfo) {
      previewResult.subPackageInfo.forEach(pkg => {
        const name = pkg.name === '__FULL__' ? '完整包' : pkg.name
        console.log(`   📦 ${name}: ${(pkg.size / 1024).toFixed(1)} KB`)
      })
    }

    console.log(`\n📱 二维码已保存: ${QR_OUTPUT}`)
    console.log('   用微信扫描二维码即可体验（开发版，24小时有效）\n')

    // 4. 发送到 Telegram
    if (TG_TOKEN && TG_CHAT) {
      await sendToTelegram(QR_OUTPUT, previewResult, elapsed)
    } else {
      console.log('⚠️  未配置 TG_TOKEN / TG_CHAT，跳过 Telegram 通知')
    }

  } catch (err) {
    console.error('\n❌ 预览失败:', err.message || err)
    if (err.errMsg) console.error('   微信错误:', err.errMsg)
    process.exit(1)
  }
}

// ─── 发送 Telegram 通知 ────────────────────────────────────
function sendToTelegram(imagePath, result, elapsed) {
  // 复制到 workspace 供发送
  const workspacePath = '/root/.openclaw/workspace/preview-qrcode.jpg'
  require('fs').copyFileSync(imagePath, workspacePath)
  imagePath = workspacePath

  return new Promise((resolve, reject) => {
    const imageBuffer = fs.readFileSync(imagePath)
    const boundary = '----FormBoundary' + Date.now()

    // 构建包大小文字
    let sizeInfo = ''
    if (result.subPackageInfo) {
      result.subPackageInfo.forEach(pkg => {
        if (pkg.name === '__FULL__') {
          sizeInfo = `📦 包大小: ${(pkg.size / 1024).toFixed(1)} KB`
        }
      })
    }

    const caption = [
      '🏸 *羽毛球小程序 - 预览版*',
      '',
      `🕐 ${new Date().toLocaleString('zh-CN')}`,
      `⏱ 构建耗时: ${elapsed}s`,
      sizeInfo,
      '',
      '扫描上方二维码即可体验（24小时有效）',
    ].filter(Boolean).join('\n')

    // multipart/form-data
    const parts = []
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${TG_CHAT}`,
      `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}`,
      `--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nMarkdown`,
    )
    const header = Buffer.from(parts.join('\r\n') + `\r\n--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="qrcode.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`)
    const footer = Buffer.from(`\r\n--${boundary}--`)
    const body   = Buffer.concat([header, imageBuffer, footer])

    const options = {
      hostname: 'api.telegram.org',
      path:     `/bot${TG_TOKEN}/sendPhoto`,
      method:   'POST',
      headers:  {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }

    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        const resp = JSON.parse(data)
        if (resp.ok) {
          console.log('📨 二维码已发送到 Telegram！')
          resolve()
        } else {
          console.error('❌ Telegram 发送失败:', resp.description)
          reject(new Error(resp.description))
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

main()

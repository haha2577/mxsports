const fs   = require('fs')
const path = require('path')

const VERSION_FILE  = path.join(__dirname, 'VERSION')
const MANIFEST_FILE = path.join(__dirname, '../frontend/src/manifest.json')

const cur   = (fs.existsSync(VERSION_FILE) ? fs.readFileSync(VERSION_FILE, 'utf8').trim() : '0.0.0') || '0.0.0'
const parts = cur.split('.').map(Number)
parts[2]++
const next  = parts.join('.')

fs.writeFileSync(VERSION_FILE, next)

const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'))
manifest.versionName = next
manifest.versionCode = String(parts[0] * 10000 + parts[1] * 100 + parts[2])
fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2))

console.log(`🔢 版本 ${cur} → ${next}`)

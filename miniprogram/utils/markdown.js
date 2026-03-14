/**
 * 轻量 Markdown → rich-text nodes 转换器
 * 支持：标题(#)、加粗(**)、斜体(*)、行内代码(`)、代码块(```)、
 *       无序列表(-/*)、有序列表(1.)、分隔线(---)、段落
 *
 * 注意：rich-text nodes 不支持外部 class，全部用内联 style。
 */

var STYLES = {
  p:         'display:block;font-size:30rpx;color:#1a1a1a;line-height:1.7;margin:4rpx 0;',
  h1:        'display:block;font-size:40rpx;font-weight:700;color:#1a1a1a;line-height:1.4;margin:16rpx 0 8rpx;',
  h2:        'display:block;font-size:36rpx;font-weight:700;color:#1a1a1a;line-height:1.4;margin:14rpx 0 6rpx;',
  h3:        'display:block;font-size:32rpx;font-weight:700;color:#1a1a1a;line-height:1.4;margin:12rpx 0 6rpx;',
  h4:        'display:block;font-size:30rpx;font-weight:700;color:#1a1a1a;line-height:1.4;margin:10rpx 0 4rpx;',
  li:        'display:block;font-size:30rpx;color:#1a1a1a;line-height:1.7;margin:4rpx 0;padding-left:2em;',
  bold:      'font-weight:700;',
  italic:    'font-style:italic;',
  code:      'background:#f0f0f0;border-radius:4px;padding:0 4px;font-size:26rpx;font-family:monospace;',
  codeBlock: 'display:block;background:#f4f4f4;border-radius:8px;padding:16rpx 20rpx;margin:12rpx 0;font-size:26rpx;font-family:monospace;white-space:pre-wrap;word-break:break-all;color:#333;',
  hr:        'display:block;height:1px;background:#e0e0e0;margin:16rpx 0;',
}

function mdToNodes(md) {
  if (!md) return []
  var lines = md.split('\n')
  var nodes = []
  var i = 0

  while (i < lines.length) {
    var line = lines[i]

    // 代码块 ```
    if (line.trimLeft().indexOf('```') === 0) {
      var codeLines = []
      i++
      while (i < lines.length && lines[i].trimLeft().indexOf('```') !== 0) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      nodes.push({
        name: 'span',
        attrs: { style: STYLES.codeBlock },
        children: [{ type: 'text', text: codeLines.join('\n') }]
      })
      continue
    }

    // 分隔线
    if (/^-{3,}$|^\*{3,}$|^_{3,}$/.test(line.trim())) {
      nodes.push({ name: 'span', attrs: { style: STYLES.hr }, children: [] })
      i++
      continue
    }

    // 标题
    var hMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (hMatch) {
      var level = Math.min(hMatch[1].length, 4)
      var hStyle = STYLES['h' + level]
      nodes.push({
        name: 'span',
        attrs: { style: hStyle },
        children: inlineNodes(hMatch[2])
      })
      i++
      continue
    }

    // 无序列表
    if (/^[\-\*\+]\s+/.test(line)) {
      while (i < lines.length && /^[\-\*\+]\s+/.test(lines[i])) {
        var itemText = lines[i].replace(/^[\-\*\+]\s+/, '')
        nodes.push({
          name: 'span',
          attrs: { style: STYLES.li },
          children: [{ type: 'text', text: '• ' }].concat(inlineNodes(itemText))
        })
        i++
      }
      continue
    }

    // 有序列表
    if (/^\d+\.\s+/.test(line)) {
      var idx = 1
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        var oItemText = lines[i].replace(/^\d+\.\s+/, '')
        nodes.push({
          name: 'span',
          attrs: { style: STYLES.li },
          children: [{ type: 'text', text: idx + '. ' }].concat(inlineNodes(oItemText))
        })
        idx++
        i++
      }
      continue
    }

    // 空行跳过
    if (line.trim() === '') {
      i++
      continue
    }

    // 普通段落
    nodes.push({
      name: 'span',
      attrs: { style: STYLES.p },
      children: inlineNodes(line)
    })
    i++
  }

  return nodes
}

/**
 * 处理行内元素：加粗、斜体、行内代码
 */
function inlineNodes(text) {
  if (!text) return []
  var result = []
  var re = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g
  var last = 0
  var m

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      result.push({ type: 'text', text: text.slice(last, m.index) })
    }

    if (m[0].indexOf('**') === 0) {
      result.push({
        name: 'span',
        attrs: { style: STYLES.bold },
        children: [{ type: 'text', text: m[2] }]
      })
    } else if (m[0].indexOf('*') === 0) {
      result.push({
        name: 'span',
        attrs: { style: STYLES.italic },
        children: [{ type: 'text', text: m[3] }]
      })
    } else if (m[0].indexOf('`') === 0) {
      result.push({
        name: 'span',
        attrs: { style: STYLES.code },
        children: [{ type: 'text', text: m[4] }]
      })
    }

    last = m.index + m[0].length
  }

  if (last < text.length) {
    result.push({ type: 'text', text: text.slice(last) })
  }

  return result.length ? result : [{ type: 'text', text: text }]
}

module.exports = { mdToNodes }

/**
 * 轻量 Markdown → rich-text nodes 转换器
 * 支持：标题(#)、加粗(**)、斜体(*)、行内代码(`)、代码块(```)、
 *       无序列表(-/*)、有序列表(1.)、分隔线(---)、表格(|)、段落
 *
 * 注意：rich-text nodes 不支持外部 class，全部用内联 style。
 */

var STYLES = {
  p:            'display:block;font-size:30rpx;color:#1a1a1a;line-height:1.7;margin:4rpx 0;',
  h1:           'display:block;font-size:40rpx;font-weight:700;color:#1a1a1a;line-height:1.4;margin:16rpx 0 8rpx;',
  h2:           'display:block;font-size:36rpx;font-weight:700;color:#1a1a1a;line-height:1.4;margin:14rpx 0 6rpx;',
  h3:           'display:block;font-size:32rpx;font-weight:700;color:#1a1a1a;line-height:1.4;margin:12rpx 0 6rpx;',
  h4:           'display:block;font-size:30rpx;font-weight:700;color:#1a1a1a;line-height:1.4;margin:10rpx 0 4rpx;',
  li:           'display:block;font-size:30rpx;color:#1a1a1a;line-height:1.7;margin:4rpx 0;padding-left:2em;',
  bold:         'font-weight:700;',
  italic:       'font-style:italic;',
  code:         'background:#f0f0f0;border-radius:4px;padding:0 4px;font-size:26rpx;font-family:monospace;',
  hr:           'display:block;height:1px;background:#e0e0e0;margin:16rpx 0;',
  // 代码块
  codeWrap:     'display:block;background:#1e1e1e;border-radius:12px;margin:12rpx 0;overflow:hidden;',
  codeLang:     'display:block;background:#2d2d2d;padding:8rpx 20rpx;font-size:24rpx;color:#aaa;font-family:monospace;',
  codeBlock:    'display:block;padding:16rpx 20rpx;font-size:26rpx;font-family:monospace;white-space:pre-wrap;word-break:break-all;color:#d4d4d4;line-height:1.6;',
  // 表格
  table:        'display:block;margin:12rpx 0;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;',
  thead:        'display:block;background:#f5f5f5;',
  tbody:        'display:block;',
  tr:           'display:flex;border-bottom:1px solid #e0e0e0;',
  trLast:       'display:flex;',
  th:           'flex:1;padding:12rpx 16rpx;font-size:26rpx;font-weight:700;color:#333;word-break:break-all;',
  td:           'flex:1;padding:12rpx 16rpx;font-size:26rpx;color:#555;word-break:break-all;',
  tdAlt:        'flex:1;padding:12rpx 16rpx;font-size:26rpx;color:#555;word-break:break-all;background:#fafafa;',
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
      var lang = line.trim().slice(3).trim() // ```python → 'python'
      var codeLines = []
      i++
      while (i < lines.length && lines[i].trimLeft().indexOf('```') !== 0) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      var codeChildren = []
      if (lang) {
        codeChildren.push({
          name: 'span',
          attrs: { style: STYLES.codeLang },
          children: [{ type: 'text', text: lang }]
        })
      }
      codeChildren.push({
        name: 'span',
        attrs: { style: STYLES.codeBlock },
        children: [{ type: 'text', text: codeLines.join('\n') }]
      })
      nodes.push({
        name: 'span',
        attrs: { style: STYLES.codeWrap },
        children: codeChildren
      })
      continue
    }

    // 表格（以 | 开头的行）
    if (line.trim().indexOf('|') === 0 || (line.indexOf('|') !== -1 && /^\|/.test(line.trim()))) {
      var tableLines = []
      while (i < lines.length && lines[i].trim().indexOf('|') !== -1) {
        tableLines.push(lines[i])
        i++
      }
      nodes.push(buildTable(tableLines))
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
      nodes.push({
        name: 'span',
        attrs: { style: STYLES['h' + level] },
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
 * 解析表格行，返回 rich-text node
 */
function buildTable(lines) {
  // 过滤掉分隔行（| --- | --- |）
  var rows = lines.filter(function(l) {
    return !/^\|[\s\|\-:]+\|?\s*$/.test(l.trim())
  })

  if (rows.length === 0) return { name: 'span', attrs: {}, children: [] }

  // 解析单行 cells
  function parseCells(line) {
    return line.trim()
      .replace(/^\|/, '').replace(/\|$/, '')
      .split('|')
      .map(function(c) { return c.trim() })
  }

  var headerCells = parseCells(rows[0])
  var bodyRows = rows.slice(1)

  // 表头
  var thChildren = headerCells.map(function(cell) {
    return {
      name: 'span',
      attrs: { style: STYLES.th },
      children: inlineNodes(cell)
    }
  })

  var theadNode = {
    name: 'span',
    attrs: { style: STYLES.thead },
    children: [{
      name: 'span',
      attrs: { style: STYLES.tr },
      children: thChildren
    }]
  }

  // 表体
  var tbodyChildren = bodyRows.map(function(row, rowIdx) {
    var cells = parseCells(row)
    var isLast = rowIdx === bodyRows.length - 1
    var tdChildren = cells.map(function(cell, colIdx) {
      var tdStyle = (rowIdx % 2 === 1) ? STYLES.tdAlt : STYLES.td
      return {
        name: 'span',
        attrs: { style: tdStyle },
        children: inlineNodes(cell)
      }
    })
    return {
      name: 'span',
      attrs: { style: isLast ? STYLES.trLast : STYLES.tr },
      children: tdChildren
    }
  })

  var tbodyNode = {
    name: 'span',
    attrs: { style: STYLES.tbody },
    children: tbodyChildren
  }

  return {
    name: 'span',
    attrs: { style: STYLES.table },
    children: [theadNode, tbodyNode]
  }
}

/**
 * 处理行内元素：加粗、斜体、行内代码、<br>、<b>、<strong>、<i>、<em>、<code>
 */
function inlineNodes(text) {
  if (!text) return []
  var result = []
  // 匹配顺序：HTML标签优先，再 markdown 语法
  var re = /(<br\s*\/?>)|(<b>([\s\S]*?)<\/b>)|(<strong>([\s\S]*?)<\/strong>)|(<i>([\s\S]*?)<\/i>)|(<em>([\s\S]*?)<\/em>)|(<code>([\s\S]*?)<\/code>)|(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+)`)/g
  var last = 0
  var m

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      result.push({ type: 'text', text: text.slice(last, m.index) })
    }

    if (m[1]) {
      // <br>
      result.push({ type: 'text', text: '\n' })
    } else if (m[2]) {
      // <b>...</b>
      result.push({ name: 'span', attrs: { style: STYLES.bold }, children: inlineNodes(m[3]) })
    } else if (m[4]) {
      // <strong>...</strong>
      result.push({ name: 'span', attrs: { style: STYLES.bold }, children: inlineNodes(m[5]) })
    } else if (m[6]) {
      // <i>...</i>
      result.push({ name: 'span', attrs: { style: STYLES.italic }, children: inlineNodes(m[7]) })
    } else if (m[8]) {
      // <em>...</em>
      result.push({ name: 'span', attrs: { style: STYLES.italic }, children: inlineNodes(m[9]) })
    } else if (m[10]) {
      // <code>...</code>
      result.push({ name: 'span', attrs: { style: STYLES.code }, children: [{ type: 'text', text: m[11] }] })
    } else if (m[12]) {
      // **bold**
      result.push({ name: 'span', attrs: { style: STYLES.bold }, children: inlineNodes(m[13]) })
    } else if (m[14]) {
      // *italic*
      result.push({ name: 'span', attrs: { style: STYLES.italic }, children: inlineNodes(m[15]) })
    } else if (m[16]) {
      // `code`
      result.push({ name: 'span', attrs: { style: STYLES.code }, children: [{ type: 'text', text: m[17] }] })
    }

    last = m.index + m[0].length
  }

  if (last < text.length) {
    result.push({ type: 'text', text: text.slice(last) })
  }

  return result.length ? result : [{ type: 'text', text: text }]
}

module.exports = { mdToNodes }

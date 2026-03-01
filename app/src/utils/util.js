export function formatDate(date, fmt = 'YYYY-MM-DD HH:mm') {
  const d = new Date(date)
  const map = {
    'YYYY': d.getFullYear(),
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'),
    'HH': String(d.getHours()).padStart(2, '0'),
    'mm': String(d.getMinutes()).padStart(2, '0')
  }
  return fmt.replace(/YYYY|MM|DD|HH|mm/g, m => map[m])
}

// 循环赛对阵（Round Robin）
export function generateRoundRobin(players) {
  const matches = []
  const n = players.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      matches.push({
        id: `${i}-${j}`,
        player1: players[i],
        player2: players[j],
        score1: null,
        score2: null,
        status: 'pending'
      })
    }
  }
  return matches
}

// 单淘汰赛（随机分组）
export function generateKnockout(players) {
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  const rounds = []
  let current = shuffled
  let roundNum = 1
  while (current.length > 1) {
    const round = []
    for (let i = 0; i < current.length; i += 2) {
      round.push({
        id: `r${roundNum}-${Math.floor(i/2)}`,
        player1: current[i],
        player2: current[i + 1] || { name: '轮空', id: 'bye' },
        score1: null, score2: null,
        status: 'pending', round: roundNum
      })
    }
    rounds.push(round)
    current = new Array(Math.ceil(current.length / 2)).fill(null)
    roundNum++
  }
  return rounds
}

// 分组循环 + 淘汰赛（混合赛制）
export function generateGroupStage(players, groupSize = 4) {
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  const groups = []
  for (let i = 0; i < shuffled.length; i += groupSize) {
    const group = shuffled.slice(i, i + groupSize)
    groups.push({
      name: `第${groups.length + 1}组`,
      players: group,
      matches: generateRoundRobin(group)
    })
  }
  return groups
}

export const storage = {
  set(key, value) { uni.setStorageSync(key, JSON.stringify(value)) },
  get(key) {
    try { return JSON.parse(uni.getStorageSync(key)) } catch { return null }
  },
  remove(key) { uni.removeStorageSync(key) }
}

import type { ChartLabels } from './chronology.ts'
import { chartPrefix, chronologySvg, safeColor } from './chronology.ts'
import { escapeHtml, svgText } from './diagram-svg.ts'

export type GitCommitStyle = 'NORMAL' | 'REVERSE' | 'HIGHLIGHT'
export type GitGraphDirection = 'LR' | 'TB' | 'BT'
interface GitCommitOptions {
  id?: string
  label?: string
  style?: GitCommitStyle
  tags?: readonly string[]
}

export type GitGraphOperation =
  | ({ op: 'commit' } & GitCommitOptions)
  | { op: 'branch', name: string, order?: number }
  | { op: 'checkout', name: string }
  | ({ op: 'merge', branch: string } & GitCommitOptions)
  | ({ op: 'cherry-pick', commit: string, parent?: string } & GitCommitOptions)

export interface GitGraphOptions extends ChartLabels {
  operations: readonly GitGraphOperation[]
  direction?: GitGraphDirection
  mainBranchName?: string
  mainBranchOrder?: number
  parallelCommits?: boolean
  showCommitLabel?: boolean
  showBranches?: boolean
  colors?: readonly (string | undefined)[]
}

interface Branch { name: string, head?: Commit, fork?: Commit, order: number, index: number }
interface Commit {
  id: string
  label: string
  branch: Branch
  parents: Commit[]
  tags: readonly string[]
  type: GitCommitStyle
  kind: 'commit' | 'merge' | 'cherry-pick'
  rank: number
  index: number
  picked?: string
}
export interface GitHistory {
  commits: Commit[]
  branches: Branch[]
  direction: GitGraphDirection
  title: string
}

export function buildGitHistory(chart: GitGraphOptions): GitHistory | undefined {
  const { operations, direction = 'LR', title = '', mainBranchName, mainBranchOrder, parallelCommits } = chart
  if (!operations.length || operations.length > 450 || !['LR', 'TB', 'BT'].includes(direction)) return
  const main = mainBranchName || 'main'
  const head: Branch = { name: main, order: Number.isFinite(mainBranchOrder) ? mainBranchOrder! : 0, index: 0 }
  let current = head
  const branches = new Map([[main, head]])
  const commits: Commit[] = []
  const byId = new Map<string, Commit>()

  function add(kind: Commit['kind'], properties: GitCommitOptions, other?: Commit): boolean {
    const { id: customId, label, style: type = 'NORMAL', tags = [] } = properties
    if (customId !== undefined && (typeof customId !== 'string' || !customId || byId.has(customId))) return false
    if (!['NORMAL', 'REVERSE', 'HIGHLIGHT'].includes(type)) return false
    if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')) return false
    let index = commits.length + 1
    while (byId.has(`c${index}`)) index++
    const id = customId ?? `c${index}`
    const parents = current.head ? [current.head] : []
    if (kind === 'merge' && other) parents.push(other)
    const rank = parallelCommits ? Math.max(-1, ...parents.map(commit => commit.rank)) + 1 : commits.length
    const commit: Commit = { id, label: label || id, branch: current, parents, tags,
      kind, type, rank, index: commits.length, picked: kind === 'cherry-pick' ? other?.id : undefined }
    commits.push(commit)
    byId.set(id, commit)
    current.head = commit
    return true
  }

  for (const operation of operations) {
    switch (operation.op) {
      case 'commit':
        if (!add('commit', operation)) return
        break
      case 'branch': {
        const { name, order = 0 } = operation
        if (typeof name !== 'string' || !name || branches.has(name) || !Number.isSafeInteger(order) || branches.size >= 40) return
        current = { name, head: current.head, fork: current.head, order, index: branches.size }
        branches.set(name, current)
        break
      }
      case 'checkout': {
        const branch = branches.get(operation.name)
        if (!branch) return
        current = branch
        break
      }
      case 'merge': {
        const source = branches.get(operation.branch)
        if (!source?.head || source === current || !current.head || source.head === current.head || !add('merge', operation, source.head)) return
        break
      }
      case 'cherry-pick': {
        const from = byId.get(operation.commit)
        const { parent, tags } = operation
        if (!from || from.branch === current || !current.head
          || (parent !== undefined && !from.parents.some(commit => commit.id === parent))
          || (from.kind === 'merge' && parent === undefined)) return
        if (!add('cherry-pick', { ...operation, tags: tags ?? [`cherry-pick: ${from.id}`] }, from)) return
        break
      }
      default: return
    }
  }
  if (!commits.length) return
  return { commits, branches: [...branches.values()].sort((a, b) => a.order - b.order || a.index - b.index), direction, title }
}

const branchColors = ['#6ba2db', '#e7b76f', '#70c1a4', '#b6a0da', '#e88998', '#59b9be', '#acc272', '#d68d61']

export function gitGraphChart(chart: GitGraphOptions): string | undefined {
  const history = buildGitHistory(chart)
  if (!history) return
  const { commits, branches, direction, title } = history
  const showLabels = chart.showCommitLabel !== false
  const showBranches = chart.showBranches !== false
  const lanes = new Map(branches.map((branch, index) => [branch, index]))
  const labelWidth = Math.max(80, Math.min(250, Math.max(...branches.map(branch => branch.name.length * 8)) + 30))
  const longTag = Math.min(27, Math.max(0, ...commits.flatMap(commit => commit.tags.map(tag => tag.length))))
  const horizontal = direction === 'LR'
  const ranks = Math.max(...commits.map(commit => commit.rank)) + 1
  const gap = horizontal ? Math.max(84, longTag * 6 + 25) : 47
  const laneWidth = horizontal ? 71 : Math.max(146, labelWidth, longTag * 7 + 40)
  const pad = title ? 54 : 23
  const start = horizontal ? (showBranches ? labelWidth : 22) : pad + (showBranches ? 32 : 8)
  const time = (rank: number) => start + 25 + (direction === 'BT' ? ranks - 1 - rank : rank) * gap
  const lane = (branch: Branch) => horizontal ? pad + 26 + lanes.get(branch)! * laneWidth : laneWidth / 2 + lanes.get(branch)! * laneWidth
  const point = (commit: Commit) => horizontal ? { x: time(commit.rank), y: lane(commit.branch) } : { x: lane(commit.branch), y: time(commit.rank) }
  const width = horizontal ? start + Math.max(110, ranks * gap) + 24 : Math.max(210, branches.length * laneWidth + 44)
  const height = horizontal ? pad + Math.max(92, branches.length * laneWidth + 15) : start + ranks * gap + 20
  const color = (branch: Branch) => {
    const index = lanes.get(branch)! % branchColors.length
    return safeColor(chart.colors?.[index]) ?? branchColors[index]
  }
  const abbreviated = (text: string, size: number) => text.length > size ? `${text.slice(0, size - 1)}…` : text
  const rails = showBranches ? branches.map((branch) => {
    const axis = lane(branch)
    const progression = direction === 'BT' ? -1 : 1
    const first = branch.fork ? time(branch.fork.rank) : time(0) - progression * 13
    const last = time(ranks - 1) + progression * 18
    const line = horizontal ? `M${first} ${axis}H${last}` : `M${axis} ${Math.min(first, last)}V${Math.max(first, last)}`
    const label = horizontal ? svgText(abbreviated(branch.name, 28), 13, axis, 'diagram-git-branch-label', 'start')
      : svgText(abbreviated(branch.name, 21), axis, pad + 8, 'diagram-git-branch-label')
    return `<g class="diagram-git-branch"><title>${escapeHtml(branch.name)}</title><path d="${line}" fill="none" stroke-opacity="0.65" stroke="${color(branch)}"/>${label}</g>`
  }).join('') : ''
  const edges = commits.flatMap((commit) => {
    const to = point(commit)
    return commit.parents.map((parent) => {
      const from = point(parent)
      const middleX = (from.x + to.x) / 2
      const middleY = (from.y + to.y) / 2
      const curve = horizontal
        ? `M${from.x} ${from.y}C${middleX} ${from.y} ${middleX} ${to.y} ${to.x} ${to.y}`
        : `M${from.x} ${from.y}C${from.x} ${middleY} ${to.x} ${middleY} ${to.x} ${to.y}`
      return `<path class="diagram-git-edge" fill="none" stroke-width="2" d="${curve}" stroke="${color(parent.branch === commit.branch ? commit.branch : parent.branch)}"/>`
    })
  }).join('')
  const nodes = commits.map((commit) => {
    const { x, y } = point(commit)
    const stroke = color(commit.branch)
    let node = `<circle class="diagram-git-dot" cx="${x}" cy="${y}" r="8" fill="${stroke}"/>`
    if (commit.kind === 'merge') node += `<circle class="diagram-git-ring" fill="none" stroke="currentColor" cx="${x}" cy="${y}" r="4.2"/>`
    if (commit.kind === 'cherry-pick') node += `<path class="diagram-git-ring" fill="none" stroke="currentColor" d="M${x - 3} ${y}q3 1 3-4 0 5 3 4M${x - 5} ${y + 1}h2m3 0h2"/>`
    if (commit.type === 'REVERSE') node = `<path class="diagram-git-edge" fill="none" stroke-width="2" d="M${x - 7} ${y - 7}l14 14m-14 0l14-14" stroke="${stroke}"/>`
    if (commit.type === 'HIGHLIGHT') node = `<rect class="diagram-git-dot" x="${x - 8}" y="${y - 8}" width="16" height="16" rx="2" fill="${stroke}"/>`
    const label = showLabels ? (horizontal ? svgText(abbreviated(commit.label, 17), x, y - 19, 'diagram-git-label')
      : svgText(abbreviated(commit.label, 18), x + 13, y - 9, 'diagram-git-label', 'start')) : ''
    const tag = commit.tags.join(' · ')
    const tagLabel = tag ? (horizontal ? svgText(abbreviated(tag, 27), x, y + 19, 'diagram-git-tag')
      : svgText(abbreviated(tag, 20), x + 13, y + 11, 'diagram-git-tag', 'start')) : ''
    const detail = [commit.branch.name, commit.id, commit.picked, tag].filter(Boolean).join(' / ')
    return `<g class="diagram-git-node diagram-git-${commit.kind}" data-commit-id="${escapeHtml(commit.id)}" data-parent-ids="${escapeHtml(commit.parents.map(commit => commit.id).join(', '))}"><title>${escapeHtml(detail)}</title>${node}${label}${tagLabel}</g>`
  }).join('')
  const body = `<g data-diagram-kind="gitgraph">${rails}${edges}${nodes}</g>`
  return chronologySvg(chart, chartPrefix(chart.idPrefix), 'Git graph', width, height, body)
}

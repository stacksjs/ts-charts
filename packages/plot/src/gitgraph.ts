import type { ChartLabels } from './chronology.ts'
import { boundedNumber, chartPrefix, chronologySvg, safeColor, titlePosition } from './chronology.ts'
import { escapeHtml, labelLines, svgText } from './diagram-svg.ts'

export type GitCommitStyle = 'NORMAL' | 'REVERSE' | 'HIGHLIGHT'
export type GitGraphDirection = 'LR' | 'TB' | 'BT'
interface GitCommitOptions {
  id?: string
  label?: string
  message?: string
  style?: GitCommitStyle
  tags?: readonly string[]
}

export type GitGraphOperation =
  | ({ op: 'commit' } & GitCommitOptions)
  | { op: 'branch', name: string, order?: number }
  | { op: 'checkout', name: string }
  | ({ op: 'merge', branch: string } & GitCommitOptions)
  | ({ op: 'cherry-pick', commit: string, parent?: string } & GitCommitOptions)

export interface GitLabelAppearance {
  color?: string
  background?: string
  border?: string
  fontSize?: number
}

export interface GitGraphOptions extends ChartLabels {
  operations: readonly GitGraphOperation[]
  direction?: GitGraphDirection
  mainBranchName?: string
  mainBranchOrder?: number
  titleTopMargin?: number
  /** Extra space around the graph, including its title. */
  diagramPadding?: number
  parallelCommits?: boolean
  showCommitLabel?: boolean
  /** Include generated IDs as visible labels for merges and cherry-picks. */
  showGeneratedOperationLabels?: boolean
  showBranches?: boolean
  /** Warn on duplicate commit IDs and resolve later references to the latest commit with that ID. */
  duplicateCommitIds?: 'latest'
  rotateCommitLabel?: boolean
  colors?: readonly (string | undefined)[]
  branchLabelColors?: readonly (string | undefined)[]
  branchLabelBackgrounds?: readonly (string | undefined)[]
  highlightColors?: readonly (string | undefined)[]
  background?: string
  titleColor?: string
  commitLabel?: GitLabelAppearance
  tagLabel?: GitLabelAppearance
}

interface Branch { name: string, head?: Commit, fork?: Commit, order: number, index: number }
interface Commit {
  id: string
  label: string
  generatedOperationLabel: boolean
  message?: string
  branch: Branch
  parents: Commit[]
  tags: readonly string[]
  type: GitCommitStyle
  symbol: GitCommitStyle | 'MERGE' | 'CHERRY_PICK'
  kind: 'commit' | 'merge' | 'cherry-pick'
  rank: number
  index: number
  picked?: string
  pickedParent?: string
  pickedCommit?: Commit
}
export interface GitHistory {
  commits: Commit[]
  branches: Branch[]
  direction: GitGraphDirection
  title: string
  currentBranch: string
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

  function add(kind: Commit['kind'], properties: GitCommitOptions, other?: Commit, pickedParent?: string): boolean {
    const { id: customId, label, message, style, tags = [] } = properties
    const type = style ?? 'NORMAL'
    if (customId !== undefined && (typeof customId !== 'string' || !customId)) return false
    const duplicate = customId !== undefined && byId.has(customId)
    if (duplicate && (kind !== 'commit' || chart.duplicateCommitIds !== 'latest')) return false
    if (!['NORMAL', 'REVERSE', 'HIGHLIGHT'].includes(type)) return false
    if (message !== undefined && typeof message !== 'string') return false
    if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')) return false
    let index = commits.length + 1
    while (byId.has(`c${index}`)) index++
    const id = customId ?? `c${index}`
    const parents = current.head ? [current.head] : []
    if (kind === 'merge' && other) parents.push(other)
    const rank = parallelCommits ? Math.max(other?.rank ?? -1, ...parents.map(commit => commit.rank)) + 1 : commits.length
    const symbol = style ?? (kind === 'merge' ? 'MERGE' : kind === 'cherry-pick' ? 'CHERRY_PICK' : 'NORMAL')
    const generatedOperationLabel = kind !== 'commit' && !label && customId === undefined
    const visibleTags = kind === 'cherry-pick' ? tags.filter(Boolean) : tags
    const commit: Commit = { id, label: label || id, generatedOperationLabel, message, branch: current, parents, tags: visibleTags,
      kind, type, symbol, rank, index: commits.length, picked: kind === 'cherry-pick' ? other?.id : undefined, pickedParent,
      ...(kind === 'cherry-pick' ? { pickedCommit: other } : {}) }
    if (duplicate) console.warn(`Commit ID ${id} already exists`)
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
        if (!source?.head || source === current || !current.head || source.head === current.head) return
        const message = operation.message ?? `merged branch ${source.name} into ${current.name}`
        if (!add('merge', { ...operation, message }, source.head)) return
        break
      }
      case 'cherry-pick': {
        const from = byId.get(operation.commit)
        const { parent, tags } = operation
        if (!from || from.branch === current || !current.head
          || (parent !== undefined && !from.parents.some(commit => commit.id === parent))
          || (from.kind === 'merge' && parent === undefined)) return
        const marker = `cherry-pick:${from.id}${parent && from.kind === 'merge' ? `|parent:${parent}` : ''}`
        const message = operation.message ?? `cherry-picked ${from.message || from.id} into ${current.name}`
        if (!add('cherry-pick', { ...operation, tags: tags ?? [marker], message }, from, parent)) return
        break
      }
      default: return
    }
  }
  return { commits, branches: [...branches.values()].sort((a, b) => a.order - b.order || a.index - b.index), direction, title, currentBranch: current.name }
}

const branchColors = ['#6ba2db', '#e7b76f', '#70c1a4', '#b6a0da', '#e88998', '#59b9be', '#acc272', '#d68d61']

function normalizeAppearance(value?: GitLabelAppearance): GitLabelAppearance {
  return {
    color: safeColor(value?.color),
    background: safeColor(value?.background),
    border: safeColor(value?.border),
    fontSize: boundedNumber(value?.fontSize, 6, 72),
  }
}

function labelWidth(label: string, size: number): number {
  return Math.ceil(Math.max(...labelLines(label).map((line) => {
    let width = 0
    for (const char of line) width += /[^\x00-\xffMW@%]/.test(char) ? 1 : /[ilI.,:!'| ]/.test(char) ? 0.4 : 0.72
    return width
  })) * size)
}

function decorateLabel(label: string, x: number, y: number, classes: string, anchor: 'start' | 'middle', appearance: GitLabelAppearance): string {
  const text = svgText(label, x, y, classes, anchor, appearance)
  if (!appearance.background && !appearance.border) return text
  const fontSize = appearance.fontSize ?? 14
  const width = labelWidth(label, fontSize) + 10
  const height = labelLines(label).length * (appearance.fontSize === undefined ? 16 : fontSize * 1.15) + 4
  const left = anchor === 'start' ? x - 5 : x - width / 2
  return `<rect class="${classes}-box" x="${left}" y="${y - height / 2}" width="${width}" height="${height}" rx="3" fill="${appearance.background ?? 'none'}" stroke="${appearance.border ?? 'none'}"/>${text}`
}

export function gitGraphChart(chart: GitGraphOptions): string | undefined {
  const history = buildGitHistory(chart)
  if (!history) return
  const { commits, branches, direction, title } = history
  const canShowLabel = (commit: Commit) => !commit.generatedOperationLabel || chart.showGeneratedOperationLabels !== false
  const labelledCommits = chart.showCommitLabel !== false ? commits.filter(canShowLabel) : []
  const showLabels = labelledCommits.length > 0
  const showBranches = chart.showBranches !== false
  const rotateLabels = showLabels && chart.rotateCommitLabel === true
  const lanes = new Map(branches.map((branch, index) => [branch, index]))
  const horizontal = direction === 'LR'
  const ranks = Math.max(0, ...commits.map(commit => commit.rank)) + 1
  const commitAppearance = normalizeAppearance(chart.commitLabel)
  const tagAppearance = normalizeAppearance(chart.tagLabel)
  const abbreviated = (text: string, size: number) => text.length > size ? `${text.slice(0, size - 1)}…` : text
  const branchText = (branch: Branch) => abbreviated(branch.name, horizontal ? 28 : 21)
  const branchLabelWidth = Math.max(80, Math.max(...branches.map(branch => labelWidth(branchText(branch), 14))) + 30)
  const commitSize = commitAppearance.fontSize ?? 14
  const tagSize = tagAppearance.fontSize ?? 14
  const labelLimit = rotateLabels ? 34 : horizontal ? 17 : 18
  const tagLimit = horizontal ? 27 : 20
  const labelText = (commit: Commit) => abbreviated(commit.label, labelLimit)
  const tagText = (commit: Commit) => abbreviated(commit.tags.join(' · '), tagLimit)
  const longCommit = Math.max(0, ...labelledCommits.map(commit => labelWidth(labelText(commit), commitSize)))
  const longTag = Math.max(0, ...commits.map(commit => labelWidth(tagText(commit), tagSize)))
  const rotatedExtent = rotateLabels ? Math.ceil((longCommit + commitSize) / Math.SQRT2) : 0
  const tagOffset = Math.max(19, 11 + tagSize / 2)
  const commitOffset = Math.max(19, 11 + commitSize / 2)
  const gap = horizontal ? Math.max(84, longTag + 25, (rotateLabels ? rotatedExtent : longCommit) + 15) : Math.max(47, commitSize + tagSize + 20)
  const laneWidth = horizontal ? Math.max(71, rotatedExtent + 42, 26 + commitSize + tagSize) : Math.max(146, branchLabelWidth, 2 * Math.max(longTag, rotateLabels ? rotatedExtent : longCommit) + 44)
  const titleY = titlePosition(chart.titleTopMargin)
  const pad = (title ? Math.max(54, titleY + 26) : 23) + Math.max(0, commitSize - 20, tagSize - 20)
  const leftLabelSpace = Math.ceil(Math.max(longTag, rotateLabels ? 0 : longCommit) / 2) + 9
  const start = horizontal ? Math.max(showBranches ? branchLabelWidth : 22, leftLabelSpace) : pad + Math.max(showBranches ? 32 : 8, rotatedExtent + 14)
  const time = (rank: number) => start + 25 + (direction === 'BT' ? ranks - 1 - rank : rank) * gap
  const lane = (branch: Branch) => horizontal ? pad + 26 + lanes.get(branch)! * laneWidth : laneWidth / 2 + lanes.get(branch)! * laneWidth
  const point = (commit: Commit) => horizontal ? { x: time(commit.rank), y: lane(commit.branch) } : { x: lane(commit.branch), y: time(commit.rank) }
  const width = horizontal ? start + Math.max(110, ranks * gap) + 24 : Math.max(210, branches.length * laneWidth + 44)
  const height = horizontal ? pad + Math.max(92, branches.length * laneWidth + 15) : start + ranks * gap + 20
  const colorIndex = (branch: Branch) => lanes.get(branch)! % branchColors.length
  const color = (branch: Branch) => safeColor(chart.colors?.[colorIndex(branch)]) ?? branchColors[colorIndex(branch)]
  const rails = showBranches ? branches.map((branch) => {
    const axis = lane(branch)
    const progression = direction === 'BT' ? -1 : 1
    const first = branch.fork ? time(branch.fork.rank) : time(0) - progression * 13
    const last = time(ranks - 1) + progression * 18
    const line = horizontal ? `M${first} ${axis}H${last}` : `M${axis} ${Math.min(first, last)}V${Math.max(first, last)}`
    const appearance = {
      color: safeColor(chart.branchLabelColors?.[colorIndex(branch)]),
      background: safeColor(chart.branchLabelBackgrounds?.[colorIndex(branch)]),
    }
    const label = horizontal ? decorateLabel(branchText(branch), 13, axis, 'diagram-git-branch-label', 'start', appearance)
      : decorateLabel(branchText(branch), axis, pad + 8, 'diagram-git-branch-label', 'middle', appearance)
    return `<g class="diagram-git-branch"><title>${escapeHtml(branch.name)}</title><path d="${line}" fill="none" stroke-opacity="0.65" stroke="${color(branch)}"/>${label}</g>`
  }).join('') : ''
  const ringColor = safeColor(chart.background) ?? 'currentColor'
  const edges = commits.map((commit) => {
    const to = point(commit)
    function edge(parent: Commit, copy = false): string {
      const from = point(parent)
      const middleX = (from.x + to.x) / 2
      const middleY = (from.y + to.y) / 2
      const curve = horizontal
        ? `M${from.x} ${from.y}C${middleX} ${from.y} ${middleX} ${to.y} ${to.x} ${to.y}`
        : `M${from.x} ${from.y}C${from.x} ${middleY} ${to.x} ${middleY} ${to.x} ${to.y}`
      const path = `<path class="diagram-git-edge${copy ? ' diagram-git-pick-edge' : ''}" fill="none" stroke-width="2" d="${curve}" stroke="${color(parent.branch)}"`
      if (!copy) return `${path}/>`
      return `${path} stroke-dasharray="5 3" data-from-commit="${escapeHtml(parent.id)}" data-to-commit="${escapeHtml(commit.id)}"><title>Cherry-picked from ${escapeHtml(parent.id)}</title></path>`
    }
    const source = commit.pickedCommit
    return commit.parents.map(parent => edge(parent)).join('') + (source ? edge(source, true) : '')
  }).join('')
  const nodes = commits.map((commit) => {
    const { x, y } = point(commit)
    const stroke = color(commit.branch)
    let node = `<circle class="diagram-git-dot" cx="${x}" cy="${y}" r="8" fill="${stroke}"/>`
    if (commit.symbol === 'MERGE') node += `<circle class="diagram-git-ring" fill="none" stroke="${ringColor}" cx="${x}" cy="${y}" r="4.2"/>`
    if (commit.symbol === 'CHERRY_PICK') node += `<path class="diagram-git-ring" fill="none" stroke="${ringColor}" d="M${x - 3} ${y}q3 1 3-4 0 5 3 4M${x - 5} ${y + 1}h2m3 0h2"/>`
    if (commit.symbol === 'REVERSE') node += `<path class="diagram-git-reverse-mark" fill="none" stroke="${ringColor}" stroke-width="2" d="M${x - 4} ${y - 4}l8 8m-8 0l8-8"/>`
    if (commit.symbol === 'HIGHLIGHT') {
      const highlight = safeColor(chart.highlightColors?.[colorIndex(commit.branch)]) ?? ringColor
      node = `<rect class="diagram-git-dot" x="${x - 8}" y="${y - 8}" width="16" height="16" rx="2" fill="${highlight}"/><rect class="diagram-git-highlight-inner" x="${x - 5}" y="${y - 5}" width="10" height="10" rx="1" fill="${stroke}"/>`
    }
    let label = ''
    if (rotateLabels && canShowLabel(commit)) {
      const angle = horizontal ? 45 : -45
      const labelX = horizontal ? x + 4 : x + 14 + Math.max(0, commitSize - 14) / 2
      const labelY = horizontal ? y + 15 + Math.max(0, commitSize - 14) / 2 : y - 8
      const text = decorateLabel(labelText(commit), labelX, labelY, 'diagram-git-label', 'start', commitAppearance)
      label = `<g transform="rotate(${angle} ${labelX} ${labelY})">${text}</g>`
    }
    else if (showLabels && canShowLabel(commit)) {
      label = horizontal ? decorateLabel(labelText(commit), x, y + commitOffset, 'diagram-git-label', 'middle', commitAppearance)
        : decorateLabel(labelText(commit), x + 13, y - Math.max(9, commitSize / 2 + 2), 'diagram-git-label', 'start', commitAppearance)
    }
    const tag = commit.tags.join(' · ')
    const tagLabel = tag ? (horizontal ? decorateLabel(tagText(commit), x, y - tagOffset, 'diagram-git-tag', 'middle', tagAppearance)
      : decorateLabel(tagText(commit), x + 13, y + Math.max(11, tagSize / 2 + 4), 'diagram-git-tag', 'start', tagAppearance)) : ''
    const detail = [commit.branch.name, commit.id, commit.message, commit.picked, commit.pickedParent, tag].filter(Boolean).join(' / ')
    const message = commit.message ? ` data-commit-message="${escapeHtml(commit.message)}"` : ''
    const provenance = commit.picked ? ` data-picked-id="${escapeHtml(commit.picked)}"${commit.pickedParent ? ` data-picked-parent="${escapeHtml(commit.pickedParent)}"` : ''}` : ''
    return `<g class="diagram-git-node diagram-git-${commit.kind}" data-commit-id="${escapeHtml(commit.id)}" data-parent-ids="${escapeHtml(commit.parents.map(commit => commit.id).join(', '))}"${provenance}${message}><title>${escapeHtml(detail)}</title>${node}${label}${tagLabel}</g>`
  }).join('')
  const padding = boundedNumber(chart.diagramPadding, 0, 2000) ?? 0
  const transform = padding ? ` transform="translate(${padding} ${padding})"` : ''
  const body = `<g data-diagram-kind="gitgraph"${transform}>${rails}${edges}${nodes}</g>`
  return chronologySvg(chart, chartPrefix(chart.idPrefix), 'Git graph', width + padding * 2, height + padding * 2, body, titleY + padding, chart)
}

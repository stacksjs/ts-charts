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

export interface GitTagAppearance extends GitLabelAppearance {
  shape?: 'tag'
  holeColor?: string
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
  /** Include the copied commit as a second parent in the diagram history. */
  cherryPickSourceParent?: boolean
  /** Allow a merge from the original branch of an inherited head commit. */
  allowMergeFromInheritedHead?: boolean
  /** Route cross-branch connections around intermediate commit dots. */
  edgeLayout?: 'orthogonal'
  /** Set commit symbol and branch label proportions, and extend rails across the diagram. */
  geometry?: 'classic' | 'compact'
  branchLine?: { color?: string, width?: number, pattern?: 'dotted' | 'dashed' }
  edgeWidth?: number
  rotateCommitLabel?: boolean
  /** Keep the complete branch, commit, and tag labels and fit the graph to them. */
  truncateLabels?: boolean
  colors?: readonly (string | undefined)[]
  branchLabelColors?: readonly (string | undefined)[]
  branchLabelBackgrounds?: readonly (string | undefined)[]
  branchLabelBorders?: readonly (string | undefined)[]
  highlightColors?: readonly (string | undefined)[]
  symbolDetailColor?: string
  background?: string
  titleColor?: string
  commitLabel?: GitLabelAppearance
  tagLabel?: GitTagAppearance
  /** Give each tag its own label above or beside the commit. */
  tagLayout?: 'stacked'
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
    if (other && (kind === 'merge' || chart.cherryPickSourceParent)) parents.push(other)
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
        if (chart.allowMergeFromInheritedHead === false && current.head.branch === source) return
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

function labelHeight(label: string, size?: number): number {
  return labelLines(label).length * (size === undefined ? 16 : size * 1.15) + 4
}

function decorateLabel(label: string, x: number, y: number, classes: string, anchor: 'start' | 'middle', appearance: GitLabelAppearance, compact = false): string {
  const text = svgText(label, x, y, classes, anchor, appearance)
  if (!appearance.background && !appearance.border) return text
  const fontSize = appearance.fontSize ?? 14
  const inset = compact ? 12 : 5
  const width = labelWidth(label, fontSize) + inset * 2
  const height = labelHeight(label, appearance.fontSize) + (compact ? 12 : 0)
  const left = anchor === 'start' ? x - inset : x - width / 2
  return `<rect class="${classes}-box" x="${left}" y="${y - height / 2}" width="${width}" height="${height}" rx="${compact ? 0 : 3}" fill="${appearance.background ?? 'none'}" stroke="${appearance.border ?? 'none'}"/>${text}`
}

const tagTipWidth = 10

function decorateTag(label: string, x: number, y: number, width: number, anchor: 'start' | 'middle', appearance: GitTagAppearance): string {
  const halfHeight = labelHeight(label, appearance.fontSize) / 2
  const boxWidth = width + tagTipWidth + 10
  const left = anchor === 'middle' ? x - boxWidth / 2 : x - 5
  const right = left + boxWidth
  const shoulder = left + tagTipWidth
  const points = [
    [left, y - 2], [shoulder, y - halfHeight], [right, y - halfHeight],
    [right, y + halfHeight], [shoulder, y + halfHeight], [left, y + 2],
  ].map(point => point.join(',')).join(' ')
  const shape = `<polygon class="diagram-git-tag-box" points="${points}" fill="${appearance.background ?? 'none'}" stroke="${appearance.border ?? 'currentColor'}"/>`
  const hole = `<circle class="diagram-git-tag-hole" cx="${left + 6}" cy="${y}" r="1.5" fill="${appearance.holeColor ?? 'currentColor'}"/>`
  const textX = shoulder + 5 + (anchor === 'middle' ? width / 2 : 0)
  return shape + hole + svgText(label, textX, y, 'diagram-git-tag', anchor, appearance)
}

type EdgePoint = [time: number, lane: number]

function roundedEdge(points: EdgePoint[], horizontal: boolean): string {
  const coordinates = ([time, lane]: EdgePoint) => horizontal ? `${time} ${lane}` : `${lane} ${time}`
  const distance = ([a, b]: EdgePoint, [c, d]: EdgePoint) => Math.abs(a - c) + Math.abs(b - d)
  const toward = ([time, lane]: EdgePoint, [nextTime, nextLane]: EdgePoint, offset: number): EdgePoint =>
    [time + Math.sign(nextTime - time) * offset, lane + Math.sign(nextLane - lane) * offset]
  let path = `M${coordinates(points[0])}`
  for (let index = 1; index < points.length - 1; index++) {
    const previous = points[index - 1]
    const corner = points[index]
    const next = points[index + 1]
    const radius = Math.min(10, distance(previous, corner) / 2, distance(corner, next) / 2)
    path += `L${coordinates(toward(corner, previous, radius))}Q${coordinates(corner)} ${coordinates(toward(corner, next, radius))}`
  }
  return `${path}L${coordinates(points[points.length - 1])}`
}

export function gitGraphChart(chart: GitGraphOptions): string | undefined {
  const history = buildGitHistory(chart)
  if (!history) return
  const { commits, branches, direction, title } = history
  const canShowLabel = (commit: Commit) => !commit.generatedOperationLabel || chart.showGeneratedOperationLabels !== false
  const labelledCommits = chart.showCommitLabel !== false ? commits.filter(canShowLabel) : []
  const showLabels = labelledCommits.length > 0
  const showBranches = chart.showBranches !== false
  const compact = chart.geometry === 'compact'
  const classic = chart.geometry === 'classic'
  const fullRails = compact || classic
  const rotateLabels = showLabels && chart.rotateCommitLabel === true
  const lanes = new Map(branches.map((branch, index) => [branch, index]))
  const horizontal = direction === 'LR'
  const ranks = Math.max(0, ...commits.map(commit => commit.rank)) + 1
  const commitAppearance = normalizeAppearance(chart.commitLabel)
  const tagAppearance = {
    ...normalizeAppearance(chart.tagLabel),
    holeColor: safeColor(chart.tagLabel?.holeColor),
  }
  const shapedTags = chart.tagLabel?.shape === 'tag'
  const abbreviated = (text: string, size: number) => chart.truncateLabels !== false && text.length > size ? `${text.slice(0, size - 1)}…` : text
  const branchLines = branches.map(branch => labelLines(branch.name.replace(/\r?\n|\\n/g, '<br>'))
    .map(line => abbreviated(line.trim(), horizontal ? 28 : 21)))
  const branchText = (branch: Branch) => branchLines[lanes.get(branch)!].join('<br>')
  const branchLabelWidth = !showBranches && chart.truncateLabels === false
    ? 80 : Math.max(80, Math.max(...branches.map(branch => labelWidth(branchText(branch), 14))) + 30)
  const extraBranchHeight = showBranches ? (Math.max(...branchLines.map(lines => lines.length)) - 1) * 16 + (compact ? 12 : 0) : 0
  const commitSize = commitAppearance.fontSize ?? 14
  const tagSize = tagAppearance.fontSize ?? 14
  const labelLimit = rotateLabels ? 34 : horizontal ? 17 : 18
  const tagLimit = horizontal ? 27 : 20
  const labelText = (commit: Commit) => abbreviated(commit.label, labelLimit)
  const longCommit = Math.max(0, ...labelledCommits.map(commit => labelWidth(labelText(commit), commitSize)))
  const rotatedExtent = rotateLabels ? Math.ceil((longCommit + commitSize) / Math.SQRT2) : 0
  const tagOffset = horizontal ? Math.max(19, 11 + tagSize / 2) : Math.max(11, tagSize / 2 + 4)
  const singleTagHeight = labelHeight('', tagAppearance.fontSize)
  let longTag = 0
  let extraTagHeight = 0
  const tags = commits.map((commit) => {
    const values = chart.tagLayout === 'stacked' ? [...commit.tags].reverse() : [commit.tags.join(' · ')]
    let offset = tagOffset - singleTagHeight / 2
    let stackWidth = 0
    const labels = values.filter(value => value.trim()).map((value) => {
      const text = abbreviated(value, tagLimit)
      const height = labelHeight(text, tagAppearance.fontSize)
      const center = offset + height / 2
      stackWidth = Math.max(stackWidth, labelWidth(text, tagSize))
      extraTagHeight = Math.max(extraTagHeight, offset + height - tagOffset - singleTagHeight / 2)
      offset += height + 4
      return { text, center }
    })
    if (labels.length) longTag = Math.max(longTag, stackWidth + (shapedTags ? tagTipWidth : 0))
    return { labels, width: stackWidth }
  })
  const commitOffset = Math.max(19, 11 + commitSize / 2)
  const gap = horizontal ? Math.max(84, longTag + 25, (rotateLabels ? rotatedExtent : longCommit) + 15) : Math.max(47, commitSize + tagSize + 20) + extraTagHeight
  const laneWidth = horizontal ? Math.max(71, rotatedExtent + 42, 26 + commitSize + tagSize, extraBranchHeight + 24) + extraTagHeight
    : Math.max(146, branchLabelWidth, 2 * Math.max(longTag, rotateLabels ? rotatedExtent : longCommit) + 44)
  const titleY = titlePosition(chart.titleTopMargin)
  const pad = (title ? Math.max(54, titleY + 26) : 23) + Math.max(0, commitSize - 20, tagSize - 20)
    + (horizontal ? extraTagHeight : 0)
  const leftLabelSpace = Math.ceil(Math.max(longTag, rotateLabels ? 0 : longCommit) / 2) + 9
  const start = horizontal ? Math.max(showBranches ? branchLabelWidth : 22, leftLabelSpace) : pad + extraBranchHeight + Math.max(showBranches ? 32 : 8, rotatedExtent + 14)
  const time = (rank: number) => start + 25 + (direction === 'BT' ? ranks - 1 - rank : rank) * gap
  const lane = (branch: Branch) => horizontal ? pad + 26 + extraBranchHeight / 2 + lanes.get(branch)! * laneWidth : laneWidth / 2 + lanes.get(branch)! * laneWidth
  const point = (commit: Commit) => horizontal ? { x: time(commit.rank), y: lane(commit.branch) } : { x: lane(commit.branch), y: time(commit.rank) }
  const titleWidth = chart.truncateLabels === false && title ? labelWidth(title, 14) + 24 : 0
  const diagramWidth = horizontal ? start + Math.max(110, ranks * gap) + 24 : Math.max(210, branches.length * laneWidth + 44)
  const width = Math.max(diagramWidth, titleWidth)
  const height = horizontal ? pad + extraBranchHeight / 2 + Math.max(92, branches.length * laneWidth + 15) : start + ranks * gap + 20
  const colorIndex = (branch: Branch) => lanes.get(branch)! % branchColors.length
  const laneColor = (values: readonly (string | undefined)[] | undefined, branch: Branch) =>
    safeColor(values?.[lanes.get(branch)!] ?? values?.[colorIndex(branch)])
  const color = (branch: Branch) => laneColor(chart.colors, branch) ?? branchColors[colorIndex(branch)]
  const railColor = safeColor(chart.branchLine?.color)
  const railWidth = boundedNumber(chart.branchLine?.width, 0, 16)
  const railPattern = chart.branchLine?.pattern === 'dashed' ? '4 2' : chart.branchLine?.pattern === 'dotted' ? '2' : undefined
  const railStyle = (railWidth === undefined ? '' : ` stroke-width="${railWidth}"`)
    + (railPattern ? ` stroke-dasharray="${railPattern}"` : '')
  const rails = showBranches ? branches.map((branch) => {
    const axis = lane(branch)
    const progression = direction === 'BT' ? -1 : 1
    const first = !fullRails && branch.fork ? time(branch.fork.rank) : time(0) - progression * 13
    const last = time(ranks - 1) + progression * 18
    const line = horizontal ? `M${first} ${axis}H${last}` : `M${axis} ${Math.min(first, last)}V${Math.max(first, last)}`
    const appearance = {
      color: laneColor(chart.branchLabelColors, branch),
      background: laneColor(chart.branchLabelBackgrounds, branch),
      border: laneColor(chart.branchLabelBorders, branch),
    }
    const label = horizontal ? decorateLabel(branchText(branch), 13, axis, 'diagram-git-branch-label', 'start', appearance, compact)
      : decorateLabel(branchText(branch), axis, pad + 8 + extraBranchHeight / 2, 'diagram-git-branch-label', 'middle', appearance, compact)
    return `<g class="diagram-git-branch" data-git-branch-index="${lanes.get(branch)}"><title>${escapeHtml(branch.name)}</title><path d="${line}" fill="none" stroke-opacity="${railPattern ? 1 : 0.65}" stroke="${railColor ?? color(branch)}"${railStyle}/>${label}</g>`
  }).join('') : ''
  const symbolDetail = safeColor(chart.symbolDetailColor)
  const ringColor = symbolDetail ?? safeColor(chart.background) ?? 'currentColor'
  const edgeWidth = boundedNumber(chart.edgeWidth, 0, 16)
  const edgeStyle = `stroke-width="${edgeWidth ?? 2}"${edgeWidth === undefined ? '' : ' stroke-linecap="round"'}`
  const orthogonal = chart.edgeLayout === 'orthogonal'
  const branchRanks = branches.map((): number[] => [])
  if (orthogonal) {
    for (const commit of commits) branchRanks[commit.branch.index].push(commit.rank)
  }
  function routedEdge(parent: Commit, commit: Commit, secondary: boolean): string {
    const from: EdgePoint = [time(parent.rank), lane(parent.branch)]
    const to: EdgePoint = [time(commit.rank), lane(commit.branch)]
    if (parent.branch === commit.branch) return roundedEdge([from, to], horizontal)
    const occupied = (branch: Branch) => branchRanks[branch.index].some(rank => rank > parent.rank && rank < commit.rank)
    const sourceBusy = occupied(parent.branch)
    const targetBusy = occupied(commit.branch)
    // Cross branches in the space between ranks, where there are no commit dots.
    const early = time(parent.rank + 0.5)
    const late = time(commit.rank - 0.5)
    if (sourceBusy && targetBusy) {
      const between = from[1] + Math.sign(to[1] - from[1]) * laneWidth / 2
      return roundedEdge([from, [early, from[1]], [early, between], [late, between], [late, to[1]], to], horizontal)
    }
    const crossing = sourceBusy || (!targetBusy && !secondary) ? early : late
    return roundedEdge([from, [crossing, from[1]], [crossing, to[1]], to], horizontal)
  }
  const edges = commits.map((commit) => {
    const to = point(commit)
    function edge(parent: Commit, secondary: boolean): string {
      const copy = secondary && commit.kind === 'cherry-pick'
      const from = point(parent)
      const middleX = (from.x + to.x) / 2
      const middleY = (from.y + to.y) / 2
      const curve = orthogonal ? routedEdge(parent, commit, secondary) : horizontal
        ? `M${from.x} ${from.y}C${middleX} ${from.y} ${middleX} ${to.y} ${to.x} ${to.y}`
        : `M${from.x} ${from.y}C${from.x} ${middleY} ${to.x} ${middleY} ${to.x} ${to.y}`
      const branch = secondary ? parent.branch : commit.branch
      const path = `<path class="diagram-git-edge${copy ? ' diagram-git-pick-edge' : ''}" fill="none" ${edgeStyle} d="${curve}" stroke="${color(branch)}" data-git-branch-index="${lanes.get(branch)}"`
      const endpoints = `data-from-commit="${escapeHtml(parent.id)}" data-to-commit="${escapeHtml(commit.id)}"`
      if (!copy) return `${path} ${endpoints}/>`
      return `${path} stroke-dasharray="5 3" ${endpoints}><title>Cherry-picked from ${escapeHtml(parent.id)}</title></path>`
    }
    const source = commit.pickedCommit
    return commit.parents.map((parent, index) => edge(parent, index > 0)).join('')
      + (source && !chart.cherryPickSourceParent ? edge(source, true) : '')
  }).join('')
  const dotRadius = compact ? 7 : classic ? 10 : 8
  const mergeRadius = compact ? 5 : classic ? 6 : 4.2
  const highlightRadius = compact ? 4 : classic ? 6 : 5
  const reverseRadius = classic ? 5 : 4
  const nodes = commits.map((commit) => {
    const { x, y } = point(commit)
    const stroke = color(commit.branch)
    let node = `<circle class="diagram-git-dot" cx="${x}" cy="${y}" r="${dotRadius}" fill="${stroke}"/>`
    if (commit.symbol === 'MERGE') node += `<circle class="diagram-git-ring" fill="${symbolDetail ?? 'none'}" stroke="${ringColor}" cx="${x}" cy="${y}" r="${mergeRadius}"/>`
    if (commit.symbol === 'CHERRY_PICK') node += `<path class="diagram-git-ring" fill="none" stroke="${ringColor}" d="M${x - 3} ${y}q3 1 3-4 0 5 3 4M${x - 5} ${y + 1}h2m3 0h2"/>`
    if (commit.symbol === 'REVERSE') {
      const size = reverseRadius * 2
      node += `<path class="diagram-git-reverse-mark" fill="none" stroke="${ringColor}" stroke-width="${classic ? 3 : 2}" d="M${x - reverseRadius} ${y - reverseRadius}l${size} ${size}m-${size} 0l${size}-${size}"/>`
    }
    if (commit.symbol === 'HIGHLIGHT') {
      const highlight = laneColor(chart.highlightColors, commit.branch) ?? ringColor
      node = `<rect class="diagram-git-dot" x="${x - dotRadius}" y="${y - dotRadius}" width="${dotRadius * 2}" height="${dotRadius * 2}" rx="${fullRails ? 0 : 2}" fill="${highlight}"/><rect class="diagram-git-highlight-inner" x="${x - highlightRadius}" y="${y - highlightRadius}" width="${highlightRadius * 2}" height="${highlightRadius * 2}" rx="${fullRails ? 0 : 1}" fill="${symbolDetail ?? stroke}"/>`
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
    const tagStack = tags[commit.index]
    const tagAnchor = horizontal ? 'middle' : 'start'
    const tagX = horizontal ? x : x + 13
    const tagLabels = tagStack.labels.map(({ text, center }) => {
      const tagY = horizontal ? y - center : y + center
      return shapedTags ? decorateTag(text, tagX, tagY, tagStack.width, tagAnchor, tagAppearance)
        : decorateLabel(text, tagX, tagY, 'diagram-git-tag', tagAnchor, tagAppearance)
    }).join('')
    const detail = [commit.branch.name, commit.id, commit.message, commit.picked, commit.pickedParent, tag].filter(Boolean).join(' / ')
    const message = commit.message ? ` data-commit-message="${escapeHtml(commit.message)}"` : ''
    const provenance = commit.picked ? ` data-picked-id="${escapeHtml(commit.picked)}"${commit.pickedParent ? ` data-picked-parent="${escapeHtml(commit.pickedParent)}"` : ''}` : ''
    const symbol = commit.symbol.toLowerCase().replace('_', '-')
    return `<g class="diagram-git-node diagram-git-${commit.kind}" data-commit-id="${escapeHtml(commit.id)}" data-parent-ids="${escapeHtml(commit.parents.map(commit => commit.id).join(', '))}"${provenance}${message} data-git-branch-index="${lanes.get(commit.branch)}" data-git-symbol="${symbol}"><title>${escapeHtml(detail)}</title>${node}${label}${tagLabels}</g>`
  }).join('')
  const padding = boundedNumber(chart.diagramPadding, 0, 2000) ?? 0
  const transform = padding ? ` transform="translate(${padding} ${padding})"` : ''
  const body = `<g data-diagram-kind="gitgraph"${transform}>${rails}${edges}${nodes}</g>`
  return chronologySvg(chart, chartPrefix(chart.idPrefix), 'Git graph', width + padding * 2, height + padding * 2, body, titleY + padding, chart)
}

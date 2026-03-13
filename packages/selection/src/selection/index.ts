import selectorFn from '../selector.ts'
import selectorAllFn from '../selectorAll.ts'
import { childMatcher } from '../matcher.ts'
import matcherFn from '../matcher.ts'
import creatorFn from '../creator.ts'
import namespace from '../namespace.ts'
import type { NamespaceLocal } from '../namespace.ts'
import defaultView from '../window.ts'
import array from '../array.ts'
import constant from '../constant.ts'
import { EnterNode } from './enter.ts'
import sparse from './sparse.ts'

export const root: [null] = [null]

// D3 nodes are DOM elements extended with expando properties for data binding, events, etc.
interface D3Node extends Element {
  __data__?: unknown
  __on?: OnEntry[]
  __transition?: Record<string, unknown>
}

interface OnEntry {
  type: string
  name: string
  value: Function
  listener: EventListener
  options: AddEventListenerOptions | boolean | undefined
}

// eslint-disable-next-line pickier/no-unused-vars
type ValueFn<T> = (this: Element, d: unknown, i: number, group: ArrayLike<Element | null>) => T
// eslint-disable-next-line pickier/no-unused-vars
type EventParamsFn = (this: Element, d: unknown, i: number, group: ArrayLike<Element | null>) => CustomEventInit

// ── attr helpers ──

function attrRemove(name: string): (this: Element) => void {
  return function (this: Element): void {
    this.removeAttribute(name)
  }
}

function attrRemoveNS(fullname: NamespaceLocal): (this: Element) => void {
  return function (this: Element): void {
    this.removeAttributeNS(fullname.space, fullname.local)
  }
}

function attrConstant(name: string, value: string | number | boolean): (this: Element) => void {
  return function (this: Element): void {
    // eslint-disable-next-line pickier/no-unused-vars
    this.setAttribute(name, `${value}`)
  }
}

function attrConstantNS(fullname: NamespaceLocal, value: string | number | boolean): (this: Element) => void {
  return function (this: Element): void {
    // eslint-disable-next-line pickier/no-unused-vars
    this.setAttributeNS(fullname.space, fullname.local, `${value}`)
  }
}

function attrFunction(name: string, value: ValueFn<string | number | null>): (this: Element) => void {
  return function (this: Element): void {
    const v = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    if (v == null) this.removeAttribute(name)
    else this.setAttribute(name, String(v))
  }
}

function attrFunctionNS(fullname: NamespaceLocal, value: ValueFn<string | number | null>): (this: Element) => void {
  return function (this: Element): void {
    const v = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local)
    else this.setAttributeNS(fullname.space, fullname.local, String(v))
  }
}

// ── style helpers ──

function styleRemove(name: string): (this: HTMLElement | SVGElement) => void {
  return function (this: HTMLElement | SVGElement): void {
    this.style.removeProperty(name)
  }
}

function styleConstant(name: string, value: string, priority: string): (this: HTMLElement | SVGElement) => void {
  return function (this: HTMLElement | SVGElement): void {
    this.style.setProperty(name, value, priority)
  }
}

function styleFunction(name: string, value: ValueFn<string | null>, priority: string): (this: HTMLElement | SVGElement) => void {
  return function (this: HTMLElement | SVGElement): void {
    const v = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    if (v == null) this.style.removeProperty(name)
    else this.style.setProperty(name, `${v}`, priority)
  }
}

export function styleValue(node: Element, name: string): string {
  const value = (node as HTMLElement | SVGElement).style.getPropertyValue(name)
  if (value != null && value !== '') return `${value}`
  const win = defaultView(node) || (typeof window !== 'undefined' ? window : undefined)
  if (!win || typeof win.getComputedStyle !== 'function') return ''
  const computed = win.getComputedStyle(node, null).getPropertyValue(name)
  return computed != null && computed !== '' ? `${computed}` : ''
}

// ── property helpers ──

function propertyRemove(name: string): (this: Element) => void {
  return function (this: Element): void {
    delete (this as unknown as Record<string, unknown>)[name]
  }
}

function propertyConstant(name: string, value: unknown): (this: Element) => void {
  return function (this: Element): void {
    (this as unknown as Record<string, unknown>)[name] = value
  }
}

function propertyFunction(name: string, value: ValueFn<unknown>): (this: Element) => void {
  return function (this: Element): void {
    const v = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    if (v == null) delete (this as unknown as Record<string, unknown>)[name]
    else (this as unknown as Record<string, unknown>)[name] = v
  }
}

// ── classed helpers ──

function classArray(string: string): string[] {
  return string.trim().split(/^|\s+/)
}

function classList(node: Element): DOMTokenList | ClassList {
  return node.classList || new ClassList(node)
}

class ClassList {
  _node: Element
  _names: string[]

  constructor(node: Element) {
    this._node = node
    this._names = classArray(node.getAttribute('class') || '')
  }

  add(name: string): void {
    const i = this._names.indexOf(name)
    if (i < 0) {
      this._names.push(name)
      this._node.setAttribute('class', this._names.join(' '))
    }
  }

  remove(name: string): void {
    const i = this._names.indexOf(name)
    if (i >= 0) {
      this._names.splice(i, 1)
      this._node.setAttribute('class', this._names.join(' '))
    }
  }

  contains(name: string): boolean {
    return this._names.indexOf(name) >= 0
  }
}

function classedAdd(node: Element, names: string[]): void {
  const list = classList(node)
  let i = -1
  const n = names.length
  while (++i < n) list.add(names[i])
}

function classedRemove(node: Element, names: string[]): void {
  const list = classList(node)
  let i = -1
  const n = names.length
  while (++i < n) list.remove(names[i])
}

function classedTrue(names: string[]): (this: Element) => void {
  return function (this: Element): void {
    classedAdd(this, names)
  }
}

function classedFalse(names: string[]): (this: Element) => void {
  return function (this: Element): void {
    classedRemove(this, names)
  }
}

function classedFunction(names: string[], value: ValueFn<boolean>): (this: Element) => void {
  return function (this: Element): void {
    (value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>]) ? classedAdd : classedRemove)(this, names)
  }
}

// ── text helpers ──

function textRemove(this: Element): void {
  this.textContent = ''
}

function textConstant(value: string): (this: Element) => void {
  return function (this: Element): void {
    // eslint-disable-next-line pickier/no-unused-vars
    this.textContent = `${value}`
  }
}

function textFunction(value: ValueFn<string | null>): (this: Element) => void {
  return function (this: Element): void {
    const v = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    // eslint-disable-next-line pickier/no-unused-vars
    this.textContent = v == null ? '' : `${v}`
  }
}

// ── html helpers ──

function htmlRemove(this: Element): void {
  this.innerHTML = ''
}

function htmlConstant(value: string): (this: Element) => void {
  return function (this: Element): void {
    this.innerHTML = value
  }
}

function htmlFunction(value: ValueFn<string | null>): (this: Element) => void {
  return function (this: Element): void {
    const v = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    this.innerHTML = v == null ? '' : v
  }
}

// ── raise/lower helpers ──

function raiseNode(this: Element): void {
  if (this.nextSibling) this.parentNode!.appendChild(this)
}

function lowerNode(this: Element): void {
  if (this.previousSibling) this.parentNode!.insertBefore(this, this.parentNode!.firstChild)
}

// ── remove helpers ──

function removeNode(this: Element): void {
  const parent = this.parentNode
  if (parent) parent.removeChild(this)
}

// ── clone helpers ──

function selectionCloneShallow(this: Element): Element {
  const clone = this.cloneNode(false) as Element
  const parent = this.parentNode
  return parent ? parent.insertBefore(clone, this.nextSibling) as Element : clone
}

function selectionCloneDeep(this: Element): Element {
  const clone = this.cloneNode(true) as Element
  const parent = this.parentNode
  return parent ? parent.insertBefore(clone, this.nextSibling) as Element : clone
}

// ── on helpers ──

function contextListener(listener: Function, node?: D3Node): (this: D3Node, event: Event) => void {
  return function (this: D3Node, event: Event): void {
    const target: D3Node = this || node || event.currentTarget as D3Node
    listener.call(target, event, target?.__data__)
  }
}

function parseTypenames(typenames: string): Array<{ type: string, name: string }> {
  // eslint-disable-next-line pickier/no-unused-vars
  return typenames.trim().split(/^|\s+/).map(function (t) {
    let name = ''
    const i = t.indexOf('.')
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i)
    return { type: t, name }
  })
}

function onRemove(typename: { type: string, name: string }): (this: D3Node) => void {
  return function (this: D3Node): void {
    const on = this.__on
    if (!on) return
    let i = -1
    for (let j = 0, m = on.length, o: OnEntry; j < m; ++j) {
      o = on[j]
      if ((!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options)
      // eslint-disable-next-line pickier/no-unused-vars
      }
      else {
        on[++i] = o
      }
    }
    if (++i) on.length = i
    else delete this.__on
  }
}

function onAdd(typename: { type: string, name: string }, value: Function, options: AddEventListenerOptions | boolean | undefined): (this: D3Node) => void {
  return function (this: D3Node): void {
    const on = this.__on
    let o: OnEntry
    const listener = contextListener(value, this) as EventListener
    if (on) for (let j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options)
        this.addEventListener(o.type, o.listener = listener, o.options = options)
        o.value = value
        return
      }
    }
    this.addEventListener(typename.type, listener, options)
    o = { type: typename.type, name: typename.name, value, listener, options }
    if (!on) this.__on = [o]
    else on.push(o)
  }
}

// ── dispatch helpers ──

function dispatchEvent(node: Element, type: string, params: CustomEventInit | undefined): void {
  const win = defaultView(node) || (typeof window !== 'undefined' ? window : undefined)

  let event: Event
  if (win && typeof win.CustomEvent === 'function') {
    event = new win.CustomEvent(type, params)
  // eslint-disable-next-line pickier/no-unused-vars
  }
  else if (typeof CustomEvent === 'function') {
    event = new CustomEvent(type, params)
  // eslint-disable-next-line pickier/no-unused-vars
  }
  else {
    const fallbackEvent = (win || window).document.createEvent('Event') as Event & { detail?: unknown }
    if (params) {
      fallbackEvent.initEvent(type, params.bubbles ?? false, params.cancelable ?? false)
      fallbackEvent.detail = params.detail
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else {
      fallbackEvent.initEvent(type, false, false)
    }
    event = fallbackEvent
  }

  node.dispatchEvent(event)
}

function dispatchConstant(type: string, params: CustomEventInit): (this: Element) => void {
  return function (this: Element): void {
    return dispatchEvent(this, type, params)
  }
}

function dispatchFunction(type: string, params: EventParamsFn): (this: Element) => void {
  return function (this: Element): void {
    return dispatchEvent(this, type, params.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>]))
  }
}

// ── data helpers ──

function bindIndex(parent: D3Node, group: D3Group, enter: Array<EnterNode | Element | null | undefined>, update: D3Group, exit: D3Group, data: unknown[]): void {
  let i = 0
  let node: Element | null | undefined
  const groupLength = group.length
  const dataLength = data.length

  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      (node as D3Node).__data__ = data[i]
      update[i] = node
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else {
      enter[i] = new EnterNode(parent, data[i])
    }
  }

  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node
    }
  }
}

function bindKey(parent: D3Node, group: D3Group, enter: Array<EnterNode | Element | null | undefined>, update: D3Group, exit: D3Group, data: unknown[], key: ValueFn<string>): void {
  let i: number
  let node: Element | null | undefined
  const nodeByKeyValue = new Map<string, Element>()
  const groupLength = group.length
  const dataLength = data.length
  const keyValues = new Array<string>(groupLength)
  let keyValue: string

  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, (node as unknown as D3Node).__data__, i, group as ArrayLike<Element | null>) + ''
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node
      // eslint-disable-next-line pickier/no-unused-vars
      }
      else {
        nodeByKeyValue.set(keyValue, node)
      }
    }
  }

  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data as unknown as ArrayLike<Element | null>) + ''
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node
      // eslint-disable-next-line pickier/no-unused-vars
      const nodeD3 = node as unknown as D3Node
      nodeD3.__data__ = data[i]
      nodeByKeyValue.delete(keyValue)
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else {
      enter[i] = new EnterNode(parent, data[i])
    }
  }

  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
      exit[i] = node
    }
  }
}

function datum(node: Element): unknown {
  return (node as unknown as D3Node).__data__
}

function arraylike<T>(data: ArrayLike<T> | Iterable<T>): ArrayLike<T> {
  return typeof data === 'object' && 'length' in data
    ? data
    : Array.from(data)
}

// ── selectAll helper ──

function arrayAll(select: Function): (this: Element) => Element[] {
  return function (this: Element): Element[] {
    return array(select.apply(this, arguments))
  }
}

// ── selectChild helpers ──

const findProto = Array.prototype.find

function childFind(match: (node: Element) => boolean): (this: Element) => Element | undefined {
  return function (this: Element): Element | undefined {
    return findProto.call(this.children, match)
  }
}

function childFirst(this: Element): Element | null {
  return this.firstElementChild ?? this.children[0] ?? null
}

// ── selectChildren helpers ──

const filterProto = Array.prototype.filter

function childrenAll(this: Element): Element[] {
  return Array.from(this.children)
}

function childrenFilter(match: (node: Element) => boolean): (this: Element) => Element[] {
  return function (this: Element): Element[] {
    return filterProto.call(this.children, match) as Element[]
  }
}

// ── sort helper ──

function ascending(a: unknown, b: unknown): number {
  return (a as number) < (b as number) ? -1 : (a as number) > (b as number) ? 1 : (a as number) >= (b as number) ? 0 : NaN
}

// ── insert helper ──

function constantNull(): null {
  return null
}

// ── Selection class ──

// D3 groups can contain Elements, EnterNodes, or gaps (null/undefined).
// Externally typed as Element for consumer convenience; EnterNodes are cast internally.
type D3Group = Array<Element | null | undefined>
type D3Parent = Element | null

export class Selection {
  _groups: D3Group[]
  _parents: D3Parent[]
  _enter?: D3Group[]
  _exit?: D3Group[]

  constructor(groups: D3Group[], parents: D3Parent[]) {
    this._groups = groups
    this._parents = parents
  }

  // For accessing parents from tests (used in assertSelection)
  get parents(): D3Parent[] {
    return this._parents
  }

  // eslint-disable-next-line pickier/no-unused-vars
  select(selectFn: string | ((this: Element, d: unknown, i: number, group: ArrayLike<Element | null>) => Element | null | undefined)): Selection {
    if (typeof selectFn !== 'function') selectFn = selectorFn(selectFn)

    const groups = this._groups
    const m = groups.length
    const subgroups: D3Group[] = new Array(m)

    for (let j = 0; j < m; ++j) {
      const group = groups[j]
      const n = group.length
      const subgroup: D3Group = subgroups[j] = new Array(n)

      for (let i = 0; i < n; ++i) {
        let node: Element | null | undefined
        let subnode: Element | null | undefined
        if ((node = group[i]) && (subnode = (selectFn as Function).call(node, (node as unknown as D3Node).__data__, i, group))) {
          if ('__data__' in node) (subnode as unknown as D3Node).__data__ = (node as unknown as D3Node).__data__
          subgroup[i] = subnode
        }
      }
    }

    return new Selection(subgroups, this._parents)
  }

  // eslint-disable-next-line pickier/no-unused-vars
  selectAll(selectFn?: string | ((this: Element, d: unknown, i: number, group: ArrayLike<Element | null>) => ArrayLike<Element>) | null): Selection {
    if (typeof selectFn === 'function') selectFn = arrayAll(selectFn)
    else selectFn = selectorAllFn(selectFn)

    const groups = this._groups
    const m = groups.length
    const subgroups: D3Group[] = []
    const parents: D3Parent[] = []

    for (let j = 0; j < m; ++j) {
      const group = groups[j]
      const n = group.length
      for (let i = 0; i < n; ++i) {
        let node: Element | null | undefined
        if (node = group[i]) {
          subgroups.push((selectFn as Function).call(node, (node as unknown as D3Node).__data__, i, group))
          parents.push(node)
        }
      }
    }

    return new Selection(subgroups, parents)
  }

  // eslint-disable-next-line pickier/no-unused-vars
  selectChild(match?: string | ((node: Element) => boolean)): Selection {
    return this.select(match == null ? childFirst
      : childFind(typeof match === 'function' ? match : childMatcher(match)))
  }

  // eslint-disable-next-line pickier/no-unused-vars
  selectChildren(match?: string | ((node: Element) => boolean)): Selection {
    return this.selectAll(match == null ? childrenAll
      : childrenFilter(typeof match === 'function' ? match : childMatcher(match)))
  }

  // eslint-disable-next-line pickier/no-unused-vars
  filter(match: string | ((this: Element, d: unknown, i: number, group: ArrayLike<Element | null>) => boolean)): Selection {
    if (typeof match !== 'function') match = matcherFn(match)

    const groups = this._groups
    const m = groups.length
    const subgroups: D3Group[] = new Array(m)

    for (let j = 0; j < m; ++j) {
      const group = groups[j]
      const n = group.length
      const subgroup: D3Group = subgroups[j] = []
      for (let i = 0; i < n; ++i) {
        let node: Element | null | undefined
        if ((node = group[i]) && (match as Function).call(node, (node as unknown as D3Node).__data__, i, group)) {
          subgroup.push(node)
        }
      }
    }

    return new Selection(subgroups, this._parents)
  }

  data(): unknown[]
  // eslint-disable-next-line pickier/no-unused-vars
  data(value: Iterable<unknown> | ((this: Element, d: unknown, i: number, parents: ArrayLike<Element | null>) => Iterable<unknown>), key?: ValueFn<string>): Selection
  // eslint-disable-next-line pickier/no-unused-vars
  data(value?: Iterable<unknown> | ((this: Element, d: unknown, i: number, parents: ArrayLike<Element | null>) => Iterable<unknown>), key?: ValueFn<string>): unknown[] | Selection {
    if (value === undefined) return Array.from(this, datum)

    const parents = this._parents
    const groups = this._groups

    if (typeof value !== 'function') value = constant(value)

    const m = groups.length
    const update: D3Group[] = new Array(m)
    const enter: D3Group[] = new Array(m)
    const exit: D3Group[] = new Array(m)

    for (let j = 0; j < m; ++j) {
      const parent = parents[j] as unknown as D3Node
      const group = groups[j]
      const groupLength = group.length
      const data = arraylike((value as Function).call(parent, parent && parent.__data__, j, parents))
      const dataLength = data.length
      const enterGroup: Array<EnterNode | Element | null | undefined> = enter[j] = new Array(dataLength)
      const updateGroup: D3Group = update[j] = new Array(dataLength)
      const exitGroup: D3Group = exit[j] = new Array(groupLength)

      if (key) {
        bindKey(parent, group, enterGroup, updateGroup, exitGroup, Array.from(data), key)
      // eslint-disable-next-line pickier/no-unused-vars
      }
      else {
        bindIndex(parent, group, enterGroup, updateGroup, exitGroup, Array.from(data))
      }

      for (let i0 = 0, i1 = 0, previous: EnterNode | Element | null | undefined, next: Element | null | undefined; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          (previous as EnterNode)._next = next || null
        }
      }
    }

    const result = new Selection(update, parents)
    result._enter = enter
    result._exit = exit
    return result
  }

  enter(): Selection {
    return new Selection(this._enter || this._groups.map(sparse), this._parents)
  }

  exit(): Selection {
    return new Selection(this._exit || this._groups.map(sparse), this._parents)
  }

  join(onenter: string | ((enter: Selection) => Selection), onupdate?: (update: Selection) => Selection, onexit?: (exit: Selection) => void): Selection {
    let enterSel = this.enter()
    let updateSel: Selection = this
    const exitSel = this.exit()

    if (typeof onenter === 'function') {
      enterSel = onenter(enterSel)
      if (enterSel) enterSel = enterSel.selection ? enterSel.selection() : enterSel
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else {
      // eslint-disable-next-line pickier/no-unused-vars
      enterSel = enterSel.append(`${onenter}`)
    }

    if (onupdate != null) {
      updateSel = onupdate(updateSel)
      if (updateSel) updateSel = updateSel.selection ? updateSel.selection() : updateSel
    }

    if (onexit == null) exitSel.remove()
    else onexit(exitSel)

    return enterSel && updateSel ? enterSel.merge(updateSel).order() : updateSel
  }

  merge(context: Selection | { selection(): Selection }): Selection {
    const selectionCtx = 'selection' in context && typeof context.selection === 'function' ? context.selection() : context as Selection

    const groups0 = this._groups
    const groups1 = selectionCtx._groups
    const m0 = groups0.length
    const m1 = groups1.length
    const m = Math.min(m0, m1)
    const merges: D3Group[] = new Array(m0)

    let j = 0
    for (; j < m; ++j) {
      const group0 = groups0[j]
      const group1 = groups1[j]
      const n = group0.length
      const merge: D3Group = merges[j] = new Array(n)
      for (let i = 0; i < n; ++i) {
        let node: Element | null | undefined
        if (node = group0[i] || group1[i]) {
          merge[i] = node
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j]
    }

    return new Selection(merges, this._parents)
  }

  selection(): Selection {
    return this
  }

  order(): Selection {
    const groups = this._groups
    for (let j = -1, m = groups.length; ++j < m;) {
      const group = groups[j]
      for (let i = group.length - 1, next = group[i], node: Element | null | undefined; --i >= 0;) {
        if (node = group[i]) {
          if (next && (node.compareDocumentPosition(next) ^ 4)) {
            const parent = next.parentNode
            if (parent) {
              parent.insertBefore(node, next)
            }
          }
          next = node
        }
      }
    }

    return this
  }

  sort(compare?: (a: unknown, b: unknown) => number): Selection {
    if (!compare) compare = ascending

    function compareNode(a: Element | null | undefined, b: Element | null | undefined): number {
      return a && b ? compare!((a as unknown as D3Node).__data__, (b as unknown as D3Node).__data__) : Number(!a) - Number(!b)
    }

    const groups = this._groups
    const m = groups.length
    const sortgroups: D3Group[] = new Array(m)

    for (let j = 0; j < m; ++j) {
      const group = groups[j]
      const n = group.length
      const sortgroup: D3Group = sortgroups[j] = new Array(n)
      for (let i = 0; i < n; ++i) {
        const node = group[i]
        if (node) {
          sortgroup[i] = node
        }
      }
      sortgroup.sort(compareNode)
    }

    return new Selection(sortgroups, this._parents).order()
  }

  call(callback: (selection: Selection, ...args: unknown[]) => void, ...args: unknown[]): Selection {
    callback.call(null, this, ...args)
    return this
  }

  nodes(): Element[] {
    return Array.from(this) as unknown as Element[]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- returns DOM node with potential expando properties (__data__, __zoom, etc.)
  node(): any {
    const groups = this._groups
    for (let j = 0, m = groups.length; j < m; ++j) {
      const group = groups[j]
      for (let i = 0, n = group.length; i < n; ++i) {
        const node = group[i]
        if (node) return node
      }
    }

    return null
  }

  size(): number {
    let size = 0
    for (const _node of this) ++size
    return size
  }

  empty(): boolean {
    return !this.node()
  }

  each(callback: (this: Element, d: unknown, i: number, group: D3Group) => void): Selection {
    const groups = this._groups
    for (let j = 0, m = groups.length; j < m; ++j) {
      const group = groups[j]
      for (let i = 0, n = group.length; i < n; ++i) {
        const node = group[i]
        if (node) callback.call(node, (node as unknown as D3Node).__data__, i, group)
      }
    }

    return this
  }

  attr(name: string): string | null
  attr(name: string, value: string | number | boolean | ValueFn<string | number | null> | null): Selection
  attr(name: string, value?: string | number | boolean | ValueFn<string | number | null> | null): string | null | Selection {
    const fullname = namespace(name)

    if (arguments.length < 2) {
      const node = this.node() as Element
      return typeof fullname === 'object'
        ? node.getAttributeNS(fullname.space, fullname.local)
        : node.getAttribute(fullname)
    }

    // The conditional chains select the right helper based on fullname type and value type.
    // We cast through `Function` because the helpers have slightly different signatures for name vs fullname.
    return this.each(((value == null
      ? (typeof fullname === 'object' ? attrRemoveNS : attrRemove) : (typeof value === 'function'
        ? (typeof fullname === 'object' ? attrFunctionNS : attrFunction)
        // eslint-disable-next-line pickier/no-unused-vars
        : (typeof fullname === 'object' ? attrConstantNS : attrConstant))) as Function)(fullname, value) as (this: Element) => void)
  }

  style(name: string): string
  style(name: string, value: string | number | null | ValueFn<string | null>, priority?: string): Selection
  style(name: string, value?: string | number | null | ValueFn<string | null>, priority?: string): string | Selection {
    if (arguments.length > 1) {
      return this.each((value == null
        ? styleRemove : typeof value === 'function'
          ? styleFunction
          // eslint-disable-next-line pickier/no-unused-vars
          : styleConstant)(name, value as string & ValueFn<string | null>, priority == null ? '' : priority) as (this: Element) => void)
    }
    return styleValue(this.node() as Element, name)
  }

  property(name: string): unknown
  property(name: string, value: unknown): Selection
  property(name: string, value?: unknown): unknown | Selection {
    if (arguments.length > 1) {
      return this.each(((value == null
        ? propertyRemove : typeof value === 'function'
          ? propertyFunction
          : propertyConstant) as (name: string, value: unknown) => (this: Element) => void)(name, value))
    }
    return (this.node() as unknown as Record<string, unknown>)[name]
  }

  classed(name: string): boolean
  classed(name: string, value: boolean | ValueFn<boolean>): Selection
  classed(name: string, value?: boolean | ValueFn<boolean>): boolean | Selection {
    // eslint-disable-next-line pickier/no-unused-vars
    const names = classArray(`${name}`)

    if (arguments.length < 2) {
      const list = classList(this.node() as Element)
      let i = -1
      const n = names.length
      while (++i < n) if (!list.contains(names[i])) return false
      return true
    }

    return this.each((typeof value === 'function'
      ? classedFunction : value
        ? classedTrue
        // eslint-disable-next-line pickier/no-unused-vars
        : classedFalse)(names, value as boolean & ValueFn<boolean>) as (this: Element) => void)
  }

  text(): string | null
  text(value: string | number | null | ValueFn<string | null>): Selection
  text(value?: string | number | null | ValueFn<string | null>): string | null | Selection {
    if (arguments.length) {
      return this.each((value == null
        ? textRemove : (typeof value === 'function'
          ? textFunction
          // eslint-disable-next-line pickier/no-unused-vars
          : textConstant)(value as string & ValueFn<string | null>)) as (this: Element) => void)
    }
    return (this.node() as Element).textContent
  }

  html(): string
  html(value: string | null | ValueFn<string | null>): Selection
  html(value?: string | null | ValueFn<string | null>): string | Selection {
    if (arguments.length) {
      return this.each((value == null
        ? htmlRemove : (typeof value === 'function'
          ? htmlFunction
          // eslint-disable-next-line pickier/no-unused-vars
          : htmlConstant)(value as string & ValueFn<string | null>)) as (this: Element) => void)
    }
    return (this.node() as Element).innerHTML
  }

  raise(): Selection {
    return this.each(raiseNode)
  }

  lower(): Selection {
    return this.each(lowerNode)
  }

  // eslint-disable-next-line pickier/no-unused-vars
  append(name: string | ((this: Element, d: unknown, i: number, group: ArrayLike<Element | null>) => Element)): Selection {
    const create: Function = typeof name === 'function' ? name : creatorFn(name)
    return this.select(function (this: Element): Element {
      return this.appendChild(create.apply(this, arguments)) as Element
    })
  }

  insert(name: string | ((this: Element, d: unknown, i: number, group: ArrayLike<Element | null>) => Element), before?: string | ((this: Element, d: unknown, i: number, group: ArrayLike<Element | null>) => Element | null) | null): Selection {
    const create: Function = typeof name === 'function' ? name : creatorFn(name)
    const selectBefore: Function = before == null ? constantNull : typeof before === 'function' ? before : selectorFn(before)
    return this.select(function (this: Element): Element {
      return this.insertBefore(create.apply(this, arguments), selectBefore.apply(this, arguments) || null) as Element
    })
  }

  remove(): Selection {
    return this.each(removeNode)
  }

  clone(deep?: boolean): Selection {
    return this.select(deep ? selectionCloneDeep : selectionCloneShallow)
  }

  datum(): unknown
  datum(value: unknown): Selection
  datum(value?: unknown): unknown | Selection {
    if (arguments.length) {
      return this.property('__data__', value)
    }
    return (this.node() as D3Node).__data__
  }

  on(typename: string): Function | undefined
  on(typename: string, value: Function | null, options?: AddEventListenerOptions | boolean): Selection
  on(typename: string, value?: Function | null, options?: AddEventListenerOptions | boolean): Function | undefined | Selection {
    // eslint-disable-next-line pickier/no-unused-vars
    const typenames = parseTypenames(`${typename}`)
    const n = typenames.length

    if (arguments.length < 2) {
      const on = (this.node() as D3Node).__on
      if (on) for (let j = 0, m = on.length, o: OnEntry; j < m; ++j) {
        for (let i = 0; i < n; ++i) {
          const t = typenames[i]
          o = on[j]
          if (t.type === o.type && t.name === o.name) {
            return o.value
          }
        }
      }
      return
    }

    const onFn = value ? onAdd : onRemove
    // eslint-disable-next-line pickier/no-unused-vars
    for (let i = 0; i < n; ++i) this.each(onFn(typenames[i], value!, options) as unknown as (this: Element) => void)
    return this
  }

  dispatch(type: string, params?: CustomEventInit | EventParamsFn): Selection {
    return this.each((typeof params === 'function'
      ? dispatchFunction
      // eslint-disable-next-line pickier/no-unused-vars
      : dispatchConstant)(type, params as CustomEventInit & EventParamsFn) as (this: Element) => void)
  }

  *[Symbol.iterator](): Generator<Element> {
    const groups = this._groups
    for (let j = 0, m = groups.length; j < m; ++j) {
      const group = groups[j]
      for (let i = 0, n = group.length; i < n; ++i) {
        const node = group[i]
        if (node) yield node as unknown as Element
      }
    }
  }
}

export default function selection(): Selection {
  return new Selection([[document.documentElement]], root)
}

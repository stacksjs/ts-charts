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

type ValueFn<T> = (this: any, d: any, i: number, group: any[]) => T
type EventParamsFn = (this: any, d: any, i: number, group: any[]) => any

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

function attrConstant(name: string, value: string): (this: Element) => void {
  return function (this: Element): void {
    this.setAttribute(name, value)
  }
}

function attrConstantNS(fullname: NamespaceLocal, value: string): (this: Element) => void {
  return function (this: Element): void {
    this.setAttributeNS(fullname.space, fullname.local, value)
  }
}

function attrFunction(name: string, value: ValueFn<any>): (this: Element) => void {
  return function (this: any): void {
    const v = value.apply(this, arguments as any)
    if (v == null) this.removeAttribute(name)
    else this.setAttribute(name, v)
  }
}

function attrFunctionNS(fullname: NamespaceLocal, value: ValueFn<any>): (this: Element) => void {
  return function (this: any): void {
    const v = value.apply(this, arguments as any)
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local)
    else this.setAttributeNS(fullname.space, fullname.local, v)
  }
}

// ── style helpers ──

function styleRemove(name: string): (this: any) => void {
  return function (this: any): void {
    this.style.removeProperty(name)
  }
}

function styleConstant(name: string, value: string, priority: string): (this: any) => void {
  return function (this: any): void {
    this.style.setProperty(name, value, priority)
  }
}

function styleFunction(name: string, value: ValueFn<any>, priority: string): (this: any) => void {
  return function (this: any): void {
    const v = value.apply(this, arguments as any)
    if (v == null) this.style.removeProperty(name)
    else this.style.setProperty(name, v, priority)
  }
}

export function styleValue(node: any, name: string): string {
  const value = node.style.getPropertyValue(name)
  if (value) return value
  const win = defaultView(node) || (typeof window !== 'undefined' ? window : undefined)
  return win ? win.getComputedStyle(node, null).getPropertyValue(name) : ''
}

// ── property helpers ──

function propertyRemove(name: string): (this: any) => void {
  return function (this: any): void {
    delete this[name]
  }
}

function propertyConstant(name: string, value: any): (this: any) => void {
  return function (this: any): void {
    this[name] = value
  }
}

function propertyFunction(name: string, value: ValueFn<any>): (this: any) => void {
  return function (this: any): void {
    const v = value.apply(this, arguments as any)
    if (v == null) delete this[name]
    else this[name] = v
  }
}

// ── classed helpers ──

function classArray(string: string): string[] {
  return string.trim().split(/^|\s+/)
}

function classList(node: any): any {
  return node.classList || new ClassList(node)
}

class ClassList {
  _node: any
  _names: string[]

  constructor(node: any) {
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

function classedAdd(node: any, names: string[]): void {
  const list = classList(node)
  let i = -1
  const n = names.length
  while (++i < n) list.add(names[i])
}

function classedRemove(node: any, names: string[]): void {
  const list = classList(node)
  let i = -1
  const n = names.length
  while (++i < n) list.remove(names[i])
}

function classedTrue(names: string[]): (this: any) => void {
  return function (this: any): void {
    classedAdd(this, names)
  }
}

function classedFalse(names: string[]): (this: any) => void {
  return function (this: any): void {
    classedRemove(this, names)
  }
}

function classedFunction(names: string[], value: ValueFn<any>): (this: any) => void {
  return function (this: any): void {
    (value.apply(this, arguments as any) ? classedAdd : classedRemove)(this, names)
  }
}

// ── text helpers ──

function textRemove(this: any): void {
  this.textContent = ''
}

function textConstant(value: string): (this: any) => void {
  return function (this: any): void {
    this.textContent = '' + value
  }
}

function textFunction(value: ValueFn<any>): (this: any) => void {
  return function (this: any): void {
    const v = value.apply(this, arguments as any)
    this.textContent = v == null ? '' : '' + v
  }
}

// ── html helpers ──

function htmlRemove(this: any): void {
  this.innerHTML = ''
}

function htmlConstant(value: string): (this: any) => void {
  return function (this: any): void {
    this.innerHTML = value
  }
}

function htmlFunction(value: ValueFn<any>): (this: any) => void {
  return function (this: any): void {
    const v = value.apply(this, arguments as any)
    this.innerHTML = v == null ? '' : v
  }
}

// ── raise/lower helpers ──

function raiseNode(this: any): void {
  if (this.nextSibling) this.parentNode.appendChild(this)
}

function lowerNode(this: any): void {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild)
}

// ── remove helpers ──

function removeNode(this: any): void {
  const parent = this.parentNode
  if (parent) parent.removeChild(this)
}

// ── clone helpers ──

function selectionCloneShallow(this: any): any {
  const clone = this.cloneNode(false)
  const parent = this.parentNode
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone
}

function selectionCloneDeep(this: any): any {
  const clone = this.cloneNode(true)
  const parent = this.parentNode
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone
}

// ── on helpers ──

function contextListener(listener: Function, node?: any): (this: any, event: Event) => void {
  return function (this: any, event: Event): void {
    const target = this || node || (event as any).currentTarget
    listener.call(target, event, target?.__data__)
  }
}

function parseTypenames(typenames: string): Array<{ type: string, name: string }> {
  return typenames.trim().split(/^|\s+/).map(function (t) {
    let name = ''
    const i = t.indexOf('.')
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i)
    return { type: t, name }
  })
}

function onRemove(typename: { type: string, name: string }): (this: any) => void {
  return function (this: any): void {
    const on = this.__on
    if (!on) return
    let i = -1
    for (let j = 0, m = on.length, o: any; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options)
      } else {
        on[++i] = o
      }
    }
    if (++i) on.length = i
    else delete this.__on
  }
}

function onAdd(typename: { type: string, name: string }, value: Function, options: any): (this: any) => void {
  return function (this: any): void {
    const on = this.__on
    let o: any
    const listener = contextListener(value, this)
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

function dispatchEvent(node: any, type: string, params: any): void {
  const win = defaultView(node) || (typeof window !== 'undefined' ? window : undefined)

  let event: any
  if (win && typeof win.CustomEvent === 'function') {
    event = new win.CustomEvent(type, params)
  } else if (typeof CustomEvent === 'function') {
    event = new CustomEvent(type, params)
  } else {
    event = (win || window).document.createEvent('Event')
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail
    else event.initEvent(type, false, false)
  }

  node.dispatchEvent(event)
}

function dispatchConstant(type: string, params: any): (this: any) => void {
  return function (this: any): void {
    return dispatchEvent(this, type, params)
  }
}

function dispatchFunction(type: string, params: EventParamsFn): (this: any) => void {
  return function (this: any): void {
    return dispatchEvent(this, type, params.apply(this, arguments as any))
  }
}

// ── data helpers ──

function bindIndex(parent: any, group: any[], enter: any[], update: any[], exit: any[], data: any[]): void {
  let i = 0
  let node: any
  const groupLength = group.length
  const dataLength = data.length

  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i]
      update[i] = node
    } else {
      enter[i] = new EnterNode(parent, data[i])
    }
  }

  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node
    }
  }
}

function bindKey(parent: any, group: any[], enter: any[], update: any[], exit: any[], data: any[], key: ValueFn<string>): void {
  let i: number
  let node: any
  const nodeByKeyValue = new Map<string, any>()
  const groupLength = group.length
  const dataLength = data.length
  const keyValues = new Array<string>(groupLength)
  let keyValue: string

  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + ''
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node
      } else {
        nodeByKeyValue.set(keyValue, node)
      }
    }
  }

  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + ''
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node
      node.__data__ = data[i]
      nodeByKeyValue.delete(keyValue)
    } else {
      enter[i] = new EnterNode(parent, data[i])
    }
  }

  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
      exit[i] = node
    }
  }
}

function datum(node: any): any {
  return node.__data__
}

function arraylike(data: any): any {
  return typeof data === 'object' && 'length' in data
    ? data
    : Array.from(data)
}

// ── selectAll helper ──

function arrayAll(select: Function): (this: any) => any[] {
  return function (this: any): any[] {
    return array(select.apply(this, arguments))
  }
}

// ── selectChild helpers ──

const findProto = Array.prototype.find

function childFind(match: (node: Element) => boolean): (this: any) => Element | undefined {
  return function (this: any): Element | undefined {
    return findProto.call(this.children, match)
  }
}

function childFirst(this: any): Element | null {
  return this.firstElementChild ?? this.children[0] ?? null
}

// ── selectChildren helpers ──

const filterProto = Array.prototype.filter

function childrenAll(this: any): Element[] {
  return Array.from(this.children)
}

function childrenFilter(match: (node: Element) => boolean): (this: any) => Element[] {
  return function (this: any): Element[] {
    return filterProto.call(this.children, match) as Element[]
  }
}

// ── sort helper ──

function ascending(a: any, b: any): number {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN
}

// ── insert helper ──

function constantNull(): null {
  return null
}

// ── Selection class ──

export class Selection {
  _groups: any[][]
  _parents: any[]
  _enter?: any[][]
  _exit?: any[][]

  constructor(groups: any[][], parents: any[]) {
    this._groups = groups
    this._parents = parents
  }

  // For accessing parents from tests (used in assertSelection)
  get parents(): any[] {
    return this._parents
  }

  select(selectFn: any): Selection {
    if (typeof selectFn !== 'function') selectFn = selectorFn(selectFn)

    const groups = this._groups
    const m = groups.length
    const subgroups: any[][] = new Array(m)

    for (let j = 0; j < m; ++j) {
      const group = groups[j]
      const n = group.length
      const subgroup: any[] = subgroups[j] = new Array(n)

      for (let i = 0; i < n; ++i) {
        let node: any
        let subnode: any
        if ((node = group[i]) && (subnode = selectFn.call(node, node.__data__, i, group))) {
          if ('__data__' in node) subnode.__data__ = node.__data__
          subgroup[i] = subnode
        }
      }
    }

    return new Selection(subgroups, this._parents)
  }

  selectAll(selectFn?: any): Selection {
    if (typeof selectFn === 'function') selectFn = arrayAll(selectFn)
    else selectFn = selectorAllFn(selectFn)

    const groups = this._groups
    const m = groups.length
    const subgroups: any[][] = []
    const parents: any[] = []

    for (let j = 0; j < m; ++j) {
      const group = groups[j]
      const n = group.length
      for (let i = 0; i < n; ++i) {
        let node: any
        if (node = group[i]) {
          subgroups.push(selectFn.call(node, node.__data__, i, group))
          parents.push(node)
        }
      }
    }

    return new Selection(subgroups, parents)
  }

  selectChild(match?: any): Selection {
    return this.select(match == null ? childFirst
      : childFind(typeof match === 'function' ? match : childMatcher(match)))
  }

  selectChildren(match?: any): Selection {
    return this.selectAll(match == null ? childrenAll
      : childrenFilter(typeof match === 'function' ? match : childMatcher(match)))
  }

  filter(match: any): Selection {
    if (typeof match !== 'function') match = matcherFn(match)

    const groups = this._groups
    const m = groups.length
    const subgroups: any[][] = new Array(m)

    for (let j = 0; j < m; ++j) {
      const group = groups[j]
      const n = group.length
      const subgroup: any[] = subgroups[j] = []
      for (let i = 0; i < n; ++i) {
        let node: any
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node)
        }
      }
    }

    return new Selection(subgroups, this._parents)
  }

  data(value?: any, key?: any): any {
    if (value === undefined) return Array.from(this, datum)

    const bind = key ? bindKey : bindIndex
    const parents = this._parents
    const groups = this._groups

    if (typeof value !== 'function') value = constant(value)

    const m = groups.length
    const update: any[][] = new Array(m)
    const enter: any[][] = new Array(m)
    const exit: any[][] = new Array(m)

    for (let j = 0; j < m; ++j) {
      const parent = parents[j]
      const group = groups[j]
      const groupLength = group.length
      const data = arraylike(value.call(parent, parent && parent.__data__, j, parents))
      const dataLength = data.length
      const enterGroup = enter[j] = new Array(dataLength)
      const updateGroup = update[j] = new Array(dataLength)
      const exitGroup = exit[j] = new Array(groupLength)

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key)

      for (let i0 = 0, i1 = 0, previous: any, next: any; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null
        }
      }
    }

    const result = new Selection(update, parents) as any
    result._enter = enter
    result._exit = exit
    return result
  }

  enter(): Selection {
    return new Selection((this as any)._enter || this._groups.map(sparse), this._parents)
  }

  exit(): Selection {
    return new Selection((this as any)._exit || this._groups.map(sparse), this._parents)
  }

  join(onenter: any, onupdate?: any, onexit?: any): Selection {
    let enterSel = this.enter()
    let updateSel: Selection = this
    const exitSel = this.exit()

    if (typeof onenter === 'function') {
      enterSel = onenter(enterSel)
      if (enterSel) enterSel = enterSel.selection ? enterSel.selection() : enterSel
    } else {
      enterSel = enterSel.append(onenter + '')
    }

    if (onupdate != null) {
      updateSel = onupdate(updateSel)
      if (updateSel) updateSel = updateSel.selection ? updateSel.selection() : updateSel
    }

    if (onexit == null) exitSel.remove()
    else onexit(exitSel)

    return enterSel && updateSel ? enterSel.merge(updateSel).order() : updateSel
  }

  merge(context: any): Selection {
    const selectionCtx = context.selection ? context.selection() : context

    const groups0 = this._groups
    const groups1 = selectionCtx._groups
    const m0 = groups0.length
    const m1 = groups1.length
    const m = Math.min(m0, m1)
    const merges: any[][] = new Array(m0)

    let j = 0
    for (; j < m; ++j) {
      const group0 = groups0[j]
      const group1 = groups1[j]
      const n = group0.length
      const merge: any[] = merges[j] = new Array(n)
      for (let i = 0; i < n; ++i) {
        let node: any
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
      for (let i = group.length - 1, next = group[i], node: any; --i >= 0;) {
        if (node = group[i]) {
          if (next && next !== node.nextSibling) {
            const parent = next.parentNode
            if (parent) {
              // Remove first to work around happy-dom insertBefore bug
              if (node.parentNode === parent) parent.removeChild(node)
              parent.insertBefore(node, next)
            }
          }
          next = node
        }
      }
    }

    return this
  }

  sort(compare?: (a: any, b: any) => number): Selection {
    if (!compare) compare = ascending

    function compareNode(a: any, b: any): number {
      return a && b ? compare!(a.__data__, b.__data__) : (!a as any) - (!b as any)
    }

    const groups = this._groups
    const m = groups.length
    const sortgroups: any[][] = new Array(m)

    for (let j = 0; j < m; ++j) {
      const group = groups[j]
      const n = group.length
      const sortgroup: any[] = sortgroups[j] = new Array(n)
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

  call(...args: any[]): Selection {
    const callback = args[0]
    args[0] = this
    callback.apply(null, args)
    return this
  }

  nodes(): any[] {
    return Array.from(this)
  }

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

  each(callback: (this: any, d: any, i: number, group: any[]) => void): Selection {
    const groups = this._groups
    for (let j = 0, m = groups.length; j < m; ++j) {
      const group = groups[j]
      for (let i = 0, n = group.length; i < n; ++i) {
        const node = group[i]
        if (node) callback.call(node, node.__data__, i, group)
      }
    }

    return this
  }

  attr(name: any, value?: any): any {
    const fullname = namespace(name)

    if (arguments.length < 2) {
      const node = this.node()
      return typeof fullname === 'object'
        ? node.getAttributeNS(fullname.space, fullname.local)
        : node.getAttribute(fullname)
    }

    return this.each((value == null
      ? (typeof fullname === 'object' ? attrRemoveNS : attrRemove) : (typeof value === 'function'
        ? (typeof fullname === 'object' ? attrFunctionNS : attrFunction)
        : (typeof fullname === 'object' ? attrConstantNS : attrConstant)))(fullname as any, value))
  }

  style(name: string, value?: any, priority?: string): any {
    if (arguments.length > 1) {
      return this.each((value == null
        ? styleRemove : typeof value === 'function'
          ? styleFunction
          : styleConstant)(name, value, priority == null ? '' : priority))
    }
    return styleValue(this.node(), name)
  }

  property(name: string, value?: any): any {
    if (arguments.length > 1) {
      return this.each((value == null
        ? propertyRemove : typeof value === 'function'
          ? propertyFunction
          : propertyConstant)(name, value))
    }
    return this.node()[name]
  }

  classed(name: any, value?: any): any {
    const names = classArray(name + '')

    if (arguments.length < 2) {
      const list = classList(this.node())
      let i = -1
      const n = names.length
      while (++i < n) if (!list.contains(names[i])) return false
      return true
    }

    return this.each((typeof value === 'function'
      ? classedFunction : value
        ? classedTrue
        : classedFalse)(names, value))
  }

  text(value?: any): any {
    if (arguments.length) {
      return this.each(value == null
        ? textRemove : (typeof value === 'function'
          ? textFunction
          : textConstant)(value))
    }
    return this.node().textContent
  }

  html(value?: any): any {
    if (arguments.length) {
      return this.each(value == null
        ? htmlRemove : (typeof value === 'function'
          ? htmlFunction
          : htmlConstant)(value))
    }
    return this.node().innerHTML
  }

  raise(): Selection {
    return this.each(raiseNode)
  }

  lower(): Selection {
    return this.each(lowerNode)
  }

  append(name: any): Selection {
    const create = typeof name === 'function' ? name : creatorFn(name)
    return this.select(function (this: any): any {
      return this.appendChild(create.apply(this, arguments))
    })
  }

  insert(name: any, before?: any): Selection {
    const create = typeof name === 'function' ? name : creatorFn(name)
    const selectBefore = before == null ? constantNull : typeof before === 'function' ? before : selectorFn(before)
    return this.select(function (this: any): any {
      return this.insertBefore(create.apply(this, arguments), selectBefore.apply(this, arguments) || null)
    })
  }

  remove(): Selection {
    return this.each(removeNode)
  }

  clone(deep?: boolean): Selection {
    return this.select(deep ? selectionCloneDeep : selectionCloneShallow)
  }

  datum(value?: any): any {
    if (arguments.length) {
      return this.property('__data__', value)
    }
    return this.node().__data__
  }

  on(typename: string, value?: any, options?: any): any {
    const typenames = parseTypenames(typename + '')
    const n = typenames.length

    if (arguments.length < 2) {
      const on = this.node().__on
      if (on) for (let j = 0, m = on.length, o: any; j < m; ++j) {
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
    for (let i = 0; i < n; ++i) this.each(onFn(typenames[i], value, options))
    return this
  }

  dispatch(type: string, params?: any): Selection {
    return this.each((typeof params === 'function'
      ? dispatchFunction
      : dispatchConstant)(type, params))
  }

  *[Symbol.iterator](): Generator<any> {
    const groups = this._groups
    for (let j = 0, m = groups.length; j < m; ++j) {
      const group = groups[j]
      for (let i = 0, n = group.length; i < n; ++i) {
        const node = group[i]
        if (node) yield node
      }
    }
  }
}

export default function selection(): Selection {
  return new Selection([[document.documentElement]], root)
}

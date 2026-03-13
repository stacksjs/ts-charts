import { selection, Selection } from '@ts-charts/selection'
import transition_attr from './attr.ts'
import transition_attrTween from './attrTween.ts'
import transition_delay from './delay.ts'
import transition_duration from './duration.ts'
import transition_ease from './ease.ts'
import transition_easeVarying from './easeVarying.ts'
import transition_filter from './filter.ts'
import transition_merge from './merge.ts'
import transition_on from './on.ts'
import transition_remove from './remove.ts'
import transition_select from './select.ts'
import transition_selectAll from './selectAll.ts'
import transition_selection from './selection.ts'
import transition_style from './style.ts'
import transition_styleTween from './styleTween.ts'
import transition_text from './text.ts'
import transition_textTween from './textTween.ts'
import transition_transition from './transition.ts'
import transition_tween from './tween.ts'
import transition_end from './end.ts'

let id = 0

type TransitionGroup = Array<Element | null>
type TransitionParent = Element | null

export class Transition {
  _groups: TransitionGroup[]
  _parents: TransitionParent[]
  _name: string | null
  _id: number

  constructor(groups: TransitionGroup[], parents: TransitionParent[], name: string | null, id: number) {
    this._groups = groups
    this._parents = parents
    this._name = name
    this._id = id
  }

  // These methods delegate to module functions via Function casts.
  // The module functions use `arguments.length` for getter/setter overloading
  // and `this` binding to access the Transition instance.
  // Callback parameters use `Function` to match D3's flexible callback API.
  select(select: string | Function): Transition { return (transition_select as Function).call(this, select) }
  selectAll(select: string | Function): Transition { return (transition_selectAll as Function).call(this, select) }
  selectChild(match: string | Function): Transition { return (Selection.prototype.selectChild as Function).call(this, match) }
  selectChildren(match: string | Function): Transition { return (Selection.prototype.selectChildren as Function).call(this, match) }
  // eslint-disable-next-line pickier/no-unused-vars
  filter(match: string | Function): Transition { return transition_filter.call(this, match as string | ((this: Element, d: unknown, i: number, group: ArrayLike<Element | null>) => boolean)) }
  merge(other: Transition): Transition { return transition_merge.call(this, other) }
  selection(): Selection { return transition_selection.call(this) }
  transition(): Transition { return transition_transition.call(this) }
  // eslint-disable-next-line pickier/no-unused-vars
  call(callback: Function, ...args: unknown[]): this { (Selection.prototype.call as Function).apply(this, [callback, ...args]); return this }
  nodes(): Element[] { return (Selection.prototype.nodes as Function).call(this) }
  node(): Element | null { return (Selection.prototype.node as Function).call(this) }
  size(): number { return (Selection.prototype.size as Function).call(this) }
  empty(): boolean { return (Selection.prototype.empty as Function).call(this) }
  // eslint-disable-next-line pickier/no-unused-vars
  each(callback: Function): this { (Selection.prototype.each as Function).call(this, callback); return this }
  on(name: string): Function | undefined
  on(name: string, listener: Function | null): Transition
  on(name: string, listener?: Function | null): Transition | Function | undefined { return (transition_on as Function).apply(this, arguments) }
  attr(name: string, value?: string | number | Function | null): Transition { return (transition_attr as Function).call(this, name, value) }
  attrTween(name: string): Function | null
  attrTween(name: string, value: Function | null): Transition
  attrTween(name: string, value?: Function | null): Transition | Function | null { return (transition_attrTween as Function).apply(this, arguments) }
  style(name: string, value?: string | number | Function | null, priority?: string): Transition { return (transition_style as Function).apply(this, arguments) }
  styleTween(name: string): Function | null
  styleTween(name: string, value: Function | null, priority?: string): Transition
  styleTween(name: string, value?: Function | null, priority?: string): Transition | Function | null { return (transition_styleTween as Function).apply(this, arguments) }
  text(value: string | number | Function | null): Transition { return (transition_text as Function).call(this, value) }
  textTween(): Function | null
  textTween(value: Function | null): Transition
  textTween(value?: Function | null): Transition | Function | null { return (transition_textTween as Function).apply(this, arguments) }
  remove(): Transition { return (transition_remove as Function).call(this) }
  tween(name: string): Function | null
  tween(name: string, value: Function | null): Transition
  tween(name: string, value?: Function | null): Transition | Function | null { return (transition_tween as Function).apply(this, arguments) }
  delay(): number
  delay(value: number | Function): Transition
  delay(value?: number | Function): Transition | number { return (transition_delay as Function).apply(this, arguments) }
  duration(): number
  duration(value: number | Function): Transition
  duration(value?: number | Function): Transition | number { return (transition_duration as Function).apply(this, arguments) }
  ease(): (t: number) => number
  ease(value: (t: number) => number): Transition
  ease(value?: (t: number) => number): Transition | ((t: number) => number) { return (transition_ease as Function).apply(this, arguments) }
  easeVarying(value: Function): Transition { return (transition_easeVarying as Function).call(this, value) }
  end(): Promise<void> { return (transition_end as Function).call(this) }
  [Symbol.iterator](): Iterator<Element> { return (Selection.prototype[Symbol.iterator] as Function).call(this) }
}

interface TransitionFunction {
  (name?: string | Transition): Transition
  prototype: typeof Transition.prototype
}

const transition: TransitionFunction = Object.assign(
  function transition(name?: string | Transition): Transition {
    return selection().transition(name as string | undefined)
  },
  { prototype: Transition.prototype }
)

export default transition

export function newId(): number {
  return ++id
}

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

export class Transition {
  _groups: any[][]
  _parents: any[]
  _name: string | null
  _id: number

  constructor(groups: any[][], parents: any[], name: string | null, id: number) {
    this._groups = groups
    this._parents = parents
    this._name = name
    this._id = id
  }

  select(select: any): any { return transition_select.call(this, select) }
  selectAll(select: any): any { return transition_selectAll.call(this, select) }
  selectChild(match: any): any { return Selection.prototype.selectChild.call(this, match) }
  selectChildren(match: any): any { return Selection.prototype.selectChildren.call(this, match) }
  filter(match: any): any { return transition_filter.call(this, match) }
  merge(other: any): any { return transition_merge.call(this, other) }
  selection(): Selection { return transition_selection.call(this) }
  transition(): any { return transition_transition.call(this) }
  call(...args: any[]): any { return Selection.prototype.call.apply(this, args as any) }
  nodes(): any[] { return Selection.prototype.nodes.call(this) }
  node(): any { return Selection.prototype.node.call(this) }
  size(): number { return Selection.prototype.size.call(this) }
  empty(): boolean { return Selection.prototype.empty.call(this) }
  each(callback: any): any { return Selection.prototype.each.call(this, callback) }
  on(name: string, listener?: any): any { return transition_on.apply(this, arguments as any) }
  attr(name: string, value?: any): any { return transition_attr.call(this, name, value) }
  attrTween(name: any, value?: any): any { return transition_attrTween.apply(this, arguments as any) }
  style(name: string, value?: any, priority?: string): any { return transition_style.apply(this, arguments as any) }
  styleTween(name: any, value?: any, priority?: any): any { return transition_styleTween.apply(this, arguments as any) }
  text(value: any): any { return transition_text.call(this, value) }
  textTween(value?: any): any { return transition_textTween.apply(this, arguments as any) }
  remove(): any { return transition_remove.call(this) }
  tween(name: any, value?: any): any { return transition_tween.apply(this, arguments as any) }
  delay(value?: any): any { return transition_delay.apply(this, arguments as any) }
  duration(value?: any): any { return transition_duration.apply(this, arguments as any) }
  ease(value?: any): any { return transition_ease.apply(this, arguments as any) }
  easeVarying(value: any): any { return transition_easeVarying.call(this, value) }
  end(): Promise<void> { return transition_end.call(this) }
  [Symbol.iterator](): Iterator<any> { return Selection.prototype[Symbol.iterator].call(this) }
}

interface TransitionFunction {
  (name?: string | Transition): Transition
  prototype: typeof Transition.prototype
}

const transition: TransitionFunction = Object.assign(
  function transition(name?: string | Transition): Transition {
    return selection().transition(name as any)
  },
  { prototype: Transition.prototype }
)

export default transition

export function newId(): number {
  return ++id
}

import { Selection } from '@ts-charts/selection'
import type { Transition } from '../transition/index.ts'
import selectionInterrupt from './interrupt.ts'
import selectionTransition from './transition.ts'

declare module '@ts-charts/selection' {
  interface Selection {
    transition(name?: string | Transition): Transition
    interrupt(name?: string): Selection
  }
}

// Monkey-patch Selection prototype
Selection.prototype.interrupt = selectionInterrupt
// eslint-disable-next-line pickier/no-unused-vars
Selection.prototype.transition = selectionTransition as (this: Selection, name?: string | Transition) => Transition

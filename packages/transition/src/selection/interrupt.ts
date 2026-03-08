import type { Selection } from '@ts-charts/selection'
import interrupt from '../interrupt.ts'

export default function selectionInterrupt(this: Selection, name?: string): Selection {
  return this.each(function (this: Element): void {
    interrupt(this, name)
  })
}

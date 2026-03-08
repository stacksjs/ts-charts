import { Selection } from '@ts-charts/selection'
import type { Transition } from './index.ts'

export default function (this: Transition): Selection {
  return new Selection(this._groups, this._parents)
}

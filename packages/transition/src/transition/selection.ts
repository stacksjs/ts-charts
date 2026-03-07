import { Selection } from '@ts-charts/selection'

export default function (this: any): Selection {
  return new Selection(this._groups, this._parents)
}

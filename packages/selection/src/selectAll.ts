import array from './array.ts'
import { Selection, root } from './selection/index.ts'

export default function selectAll(selector?: any): Selection {
  return typeof selector === 'string'
    ? new Selection([Array.from(document.querySelectorAll(selector))], [document.documentElement])
    : new Selection([array(selector)], root)
}

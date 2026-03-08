import array from './array.ts'
import { Selection, root } from './selection/index.ts'

// eslint-disable-next-line ts/no-explicit-any -- D3's selectAll accepts any array-like or iterable
export default function selectAll(selector?: string | ArrayLike<any> | Iterable<any> | null): Selection {
  return typeof selector === 'string'
    ? new Selection([Array.from(document.querySelectorAll(selector))], [document.documentElement])
    : new Selection([array(selector) as unknown as Array<Element | null>], root)
}

import { Selection, root } from './selection/index.ts'

export default function select(selector?: string | Node | Window | null): Selection {
  return typeof selector === 'string'
    ? new Selection([[document.querySelector(selector)]], [document.documentElement])
    : new Selection([[selector as unknown as Element]], root)
}

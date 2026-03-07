import { Selection, root } from './selection/index.ts'

export default function select(selector?: any): Selection {
  return typeof selector === 'string'
    ? new Selection([[document.querySelector(selector)]], [document.documentElement])
    : new Selection([[selector]], root)
}

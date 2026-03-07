import creator from './creator.ts'
import select from './select.ts'
import type { Selection } from './selection/index.ts'

export default function create(name: string): Selection {
  return select(creator(name).call(document.documentElement))
}

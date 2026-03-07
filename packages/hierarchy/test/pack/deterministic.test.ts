import { describe, expect, it } from 'bun:test'
import { hierarchy, stratify, pack } from '../../src/index.ts'

describe('pack deterministic', () => {
  it('pack is deterministic', () => {
    const data = stratify().path((d: any) => d)(
      [41, 41, 11, 11, 4, 4]
        .flatMap((n, i) => Array.from({ length: n }, (_, j) => ({ i, j })))
        .map(({ i, j }) => `/${i}/${i}-${j}`),
    )
    const packer = pack().size([100, 100]).padding(0)
    const pack1 = packer(hierarchy(data as any).count())
    for (let i = 0; i < 40; ++i) {
      expect(packer(hierarchy(data as any).count())).toEqual(pack1)
    }
  })
})

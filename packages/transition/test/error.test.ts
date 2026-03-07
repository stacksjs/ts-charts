import { expect } from 'bun:test'
import { select } from '@ts-charts/selection'
import { timeout } from '@ts-charts/timer'
import '../src/index.ts'
import jsdomit from './jsdom.ts'

// In Bun, callback-thrown errors can surface differently than in Node.
// These tests verify the transition is still cleaned up.

async function expectTransitionTerminates(run: () => void, wait = 0): Promise<void> {
  const root = document.documentElement as Element & { __transition?: unknown }

  run()
  await new Promise<void>(resolve => timeout(() => resolve(), wait))
  await Promise.resolve()

  expect(root.__transition).toBe(undefined)
}

jsdomit('transition.on("start", error) terminates the transition', async () => {
  const s = select(document.documentElement)

  await expectTransitionTerminates(() => {
    s.transition().on('start', () => { throw new Error() })
  })
})

jsdomit('transition.tween("foo", error) terminates the transition', async () => {
  const s = select(document.documentElement)

  await expectTransitionTerminates(() => {
    s.transition().tween('foo', () => { throw new Error() })
  })
})

jsdomit('transition.tween("foo", deferredError) terminates the transition', async () => {
  const s = select(document.documentElement)

  await expectTransitionTerminates(() => {
    s.transition().duration(50).tween('foo', () => {
      return function (t: number): void {
        if (t === 1) throw new Error()
      }
    })
  }, 60)
})

jsdomit('transition.on("end", error) terminates the transition', async () => {
  const s = select(document.documentElement)

  await expectTransitionTerminates(() => {
    s.transition().delay(50).duration(50).on('end', () => { throw new Error() })
  }, 120)
})

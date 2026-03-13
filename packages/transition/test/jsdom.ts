import { it } from 'bun:test'
import { Window } from 'very-happy-dom'

export default function jsdomit(message: string, htmlOrRun: string | (() => Promise<void> | void), run?: () => Promise<void> | void): void {
  let html = ''
  let fn: () => Promise<void> | void
  if (typeof htmlOrRun === 'function') {
    fn = htmlOrRun
  }
  else {
    html = htmlOrRun
    fn = run!
  }

  it(message, async () => {
    const win = new Window({ url: 'http://localhost' }) as any
    const prevWindow = globalThis.window
    const prevDocument = globalThis.document
    try {
      globalThis.window = win
      globalThis.document = win.document as any
      if (html) {
        // eslint-disable-next-line pickier/no-unused-vars
        ;(win.document.body as any).innerHTML = html
      }
      await fn()
    }
    finally {
      globalThis.window = prevWindow
      globalThis.document = prevDocument
    }
  })
}

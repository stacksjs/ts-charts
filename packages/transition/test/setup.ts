import { Window } from 'very-happy-dom'

const win = new Window({ url: 'http://localhost' }) as any
win.requestAnimationFrame = undefined
win.cancelAnimationFrame = undefined

globalThis.window = win
globalThis.document = win.document as any
;(globalThis as any).Element = (win as any).Element
// eslint-disable-next-line pickier/no-unused-vars
;(globalThis as any).Node = (win as any).Node

;(globalThis as any).__patchDomApis?.()

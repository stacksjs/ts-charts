import { Window } from 'very-happy-dom'

const win = new Window({ url: 'http://localhost' })
globalThis.window = win as any
globalThis.document = win.document as any
(globalThis as any).Element = (win as any).Element
// eslint-disable-next-line pickier/no-unused-vars
;(globalThis as any).Node = (win as any).Node

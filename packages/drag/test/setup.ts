import { Window } from 'very-happy-dom'

const win: any = new Window({ url: 'http://localhost' })
win.requestAnimationFrame = undefined
win.cancelAnimationFrame = undefined
globalThis.window = win
globalThis.document = win.document
globalThis.Element = win.Element
globalThis.Node = win.Node

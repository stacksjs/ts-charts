import { Window } from 'very-happy-dom'
const win: any = new Window({ url: 'http://localhost' })
win.requestAnimationFrame = undefined
win.cancelAnimationFrame = undefined
globalThis.window = win
globalThis.document = win.document
globalThis.Element = win.Element
globalThis.HTMLElement = win.HTMLElement
globalThis.Node = win.Node
globalThis.Text = win.Text
globalThis.Event = win.Event
globalThis.CustomEvent = win.CustomEvent

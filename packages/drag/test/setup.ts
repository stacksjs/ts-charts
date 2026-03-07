import { Window } from 'very-happy-dom'

const win = new Window({ url: 'http://localhost' })
globalThis.window = win as any
globalThis.document = win.document as any
globalThis.Element = win.Element as any
globalThis.Node = win.Node as any

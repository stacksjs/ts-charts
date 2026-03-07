import { Window } from 'very-happy-dom'

const win = new Window({ url: 'http://localhost' })

globalThis.window = win as any
globalThis.document = win.document as any
globalThis.navigator = win.navigator as any
globalThis.Element = win.Element as any
globalThis.HTMLElement = win.HTMLElement as any
globalThis.Node = win.Node as any
globalThis.Text = win.Text as any
globalThis.Comment = win.Comment as any
globalThis.DocumentFragment = win.DocumentFragment as any
globalThis.Event = win.Event as any
globalThis.CustomEvent = win.CustomEvent as any
globalThis.MutationObserver = win.MutationObserver as any

import { Window } from 'very-happy-dom'
const win = new Window({ url: 'http://localhost' })
globalThis.window = win as any
globalThis.document = win.document as any
(globalThis as any).Element = (win as any).Element
// eslint-disable-next-line pickier/no-unused-vars
;(globalThis as any).HTMLElement = (win as any).HTMLElement
// eslint-disable-next-line pickier/no-unused-vars
;(globalThis as any).Node = (win as any).Node
// eslint-disable-next-line pickier/no-unused-vars
;(globalThis as any).Text = (win as any).Text
// eslint-disable-next-line pickier/no-unused-vars
;(globalThis as any).Event = (win as any).Event
globalThis.CustomEvent = win.CustomEvent as any
globalThis.SVGElement = (win as any).SVGElement || class SVGElement {} as any

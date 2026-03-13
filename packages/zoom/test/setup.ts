import { Window } from 'very-happy-dom'
import { patchDomApis } from '../../../test/dom-polyfills.ts'

const win = new Window({ url: 'http://localhost' }) as any
win.requestAnimationFrame = undefined
win.cancelAnimationFrame = undefined
globalThis.window = win
globalThis.document = win.document as any

const g = globalThis as any
g.Element = (win as any).Element
g.HTMLElement = (win as any).HTMLElement
g.Node = (win as any).Node
g.Text = (win as any).Text
g.Event = (win as any).Event
globalThis.CustomEvent = win.CustomEvent as any
globalThis.SVGElement = (win as any).SVGElement || class SVGElement {} as any

patchDomApis()

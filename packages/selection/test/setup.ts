import { Window } from 'very-happy-dom'
import { patchDomApis } from '../../../test/dom-polyfills.ts'

const win: any = new Window({ url: 'http://localhost' })
win.requestAnimationFrame = undefined
win.cancelAnimationFrame = undefined

globalThis.window = win
globalThis.document = win.document
globalThis.navigator = win.navigator
globalThis.Element = win.Element
globalThis.HTMLElement = win.HTMLElement
globalThis.Node = win.Node
globalThis.Text = win.Text
globalThis.Comment = win.Comment
globalThis.DocumentFragment = win.DocumentFragment
globalThis.Event = win.Event
globalThis.CustomEvent = win.CustomEvent
globalThis.MutationObserver = win.MutationObserver

patchDomApis()

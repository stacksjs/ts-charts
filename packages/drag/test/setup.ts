import { Window } from 'very-happy-dom'
import { patchDomApis } from '../../../test/dom-polyfills.ts'

const win: any = new Window({ url: 'http://localhost' })
win.requestAnimationFrame = undefined
win.cancelAnimationFrame = undefined
globalThis.window = win
globalThis.document = win.document
globalThis.Element = win.Element
globalThis.Node = win.Node

patchDomApis()

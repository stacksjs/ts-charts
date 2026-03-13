import { Window } from 'very-happy-dom'

/**
 * Polyfill missing DOM APIs in very-happy-dom.
 * Patches the prototype of elements created by the current globalThis.document.
 */
function patchDomApis(): void {
  if (typeof globalThis.document === 'undefined') return
  const el = globalThis.document.createElement('div') as any
  const proto = Object.getPrototypeOf(el)
  if (!proto) return

  if (!proto.compareDocumentPosition) {
    proto.compareDocumentPosition = function (other: any): number {
      if (this === other) return 0
      let node = other
      while (node) {
        if (node === this) return 0x10 | 0x04
        node = node.parentNode
      }
      node = this as any
      while (node) {
        if (node === other) return 0x08 | 0x02
        node = node.parentNode
      }
      const parent = this.parentNode
      if (parent && parent === other.parentNode) {
        const children = Array.from(parent.childNodes)
        const a = children.indexOf(this)
        const b = children.indexOf(other)
        if (a < b) return 0x04
        if (a > b) return 0x02
      }
      return 0x01
    }
  }

  if (!proto.setAttributeNS) {
    proto.setAttributeNS = function (_ns: string | null, name: string, value: string): void {
      this.setAttribute(name, value)
    }
  }
  if (!proto.getAttributeNS) {
    proto.getAttributeNS = function (_ns: string | null, name: string): string | null {
      return this.getAttribute(name)
    }
  }
  if (!proto.removeAttributeNS) {
    proto.removeAttributeNS = function (_ns: string | null, name: string): void {
      this.removeAttribute(name)
    }
  }
  if (!proto.hasAttributeNS) {
    proto.hasAttributeNS = function (_ns: string | null, name: string): boolean {
      return this.hasAttribute(name)
    }
  }

  // Patch setAttribute to coerce values to strings (per DOM spec)
  const origSetAttribute = proto.setAttribute
  if (origSetAttribute) {
    proto.setAttribute = function (name: string, value: unknown): void {
      origSetAttribute.call(this, name, String(value))
    }
  }

  // Add getComputedStyle if missing — very-happy-dom doesn't provide it.
  // Falls back to parsing the inline style attribute since very-happy-dom
  // doesn't populate the style object from inline styles.
  if (typeof globalThis.window !== 'undefined' && !(globalThis.window as any).getComputedStyle) {
    (globalThis.window as any).getComputedStyle = function (node: any): any {
      return {
        getPropertyValue(name: string): string {
          // First check the live style object
          const val = node.style?.getPropertyValue?.(name)
          if (val != null && val !== '') return `${val}`
          // Fall back to parsing the style attribute
          const attr = node.getAttribute?.('style')
          if (attr) {
            const re = new RegExp(`(?:^|;)\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+)`, 'i')
            const m = attr.match(re)
            if (m) return m[1].trim()
          }
          return ''
        },
      }
    }
  }

  // Polyfill getPropertyPriority on style objects by wrapping setProperty to track priorities.
  // very-happy-dom style objects have null prototype with own methods, so we use the
  // element prototype's style getter descriptor to intercept and patch each style instance.
  addStylePriorityTracking(proto)
}

function addStylePriorityTracking(elementProto: any): void {
  let styleDesc: PropertyDescriptor | undefined
  let p = elementProto
  while (p) {
    styleDesc = Object.getOwnPropertyDescriptor(p, 'style')
    if (styleDesc) break
    p = Object.getPrototypeOf(p)
  }
  if (!styleDesc || !styleDesc.get) return

  const origStyleGet = styleDesc.get
  // Store priorities on the element since style getter returns new objects each time
  const priorityStore = new WeakMap<object, Record<string, string>>()

  Object.defineProperty(p, 'style', {
    get() {
      const rawStyle = origStyleGet.call(this)
      if (!rawStyle) return rawStyle

      const element = this
      if (!priorityStore.has(element)) priorityStore.set(element, {})
      const priorities = priorityStore.get(element)!

      return new Proxy(rawStyle, {
        get(target: any, prop: string | symbol): unknown {
          if (prop === 'getPropertyPriority') {
            return (name: string): string => priorities[name] || ''
          }
          if (prop === 'setProperty') {
            return (name: string, value: unknown, priority?: string): void => {
              // Reject invalid CSS values like NaN/undefined (real browsers silently ignore these)
              const strVal = value == null ? '' : `${value}`
              if (strVal === 'NaN' || strVal === 'undefined' || strVal === 'null') return
              target.setProperty(name, value, priority)
              if (priority) priorities[name] = priority
              else delete priorities[name]
            }
          }
          const val = target[prop]
          return typeof val === 'function' ? val.bind(target) : val
        },
        set(target: any, prop: string | symbol, value: unknown): boolean {
          target[prop] = value
          return true
        },
      })
    },
    configurable: true,
  })
}

// Make patchDomApis available globally for per-package setups
;(globalThis as any).__patchDomApis = patchDomApis

if (!globalThis.document) {
  const win: any = new Window({ url: 'http://localhost' })
  win.requestAnimationFrame = undefined
  win.cancelAnimationFrame = undefined

  globalThis.window = win
  globalThis.document = win.document
  globalThis.navigator = win.navigator
  globalThis.Element = win.Element
  globalThis.HTMLElement = win.HTMLElement
  globalThis.SVGElement = win.SVGElement
  globalThis.Node = win.Node
  globalThis.Text = win.Text
  globalThis.Comment = win.Comment
  globalThis.DocumentFragment = win.DocumentFragment
  globalThis.Event = win.Event
  globalThis.CustomEvent = win.CustomEvent
  globalThis.MutationObserver = win.MutationObserver
}

patchDomApis()

/**
 * Polyfill missing DOM APIs in very-happy-dom for test environments.
 * Call after setting globalThis.document from a Window instance.
 */
export function patchDomApis(): void {
  if (typeof globalThis.document === 'undefined') return

  // Get the actual prototype of DOM elements by creating one
  const el = globalThis.document.createElement('div') as any
  const proto = Object.getPrototypeOf(el)
  if (!proto) return

  // compareDocumentPosition
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

  // Namespaced attribute methods
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

}

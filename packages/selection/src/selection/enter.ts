import sparse from './sparse.ts'
import { Selection } from './index.ts'

export default function enter(this: Selection): Selection {
  return new Selection(this._enter || this._groups.map(sparse), this._parents)
}

export class EnterNode {
  ownerDocument: Document
  namespaceURI: string | null
  _next: Element | null
  _parent: Element
  __data__: unknown

  constructor(parent: Element, datum: unknown) {
    this.ownerDocument = parent.ownerDocument!
    this.namespaceURI = parent.namespaceURI
    this._next = null
    this._parent = parent
    this.__data__ = datum
  }

  appendChild(child: Node): Node {
    return this._parent.insertBefore(child, this._next)
  }

  insertBefore(child: Node, next: Node | null): Node {
    return this._parent.insertBefore(child, next)
  }

  querySelector(selector: string): Element | null {
    return this._parent.querySelector(selector)
  }

  querySelectorAll(selector: string): NodeListOf<Element> {
    return this._parent.querySelectorAll(selector)
  }
}

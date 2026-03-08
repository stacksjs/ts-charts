import namespace from './namespace.ts'
import type { NamespaceLocal } from './namespace.ts'
import { xhtml } from './namespaces.ts'

// Nodes passed as `this` can be DOM elements, Documents, or EnterNodes -- all have ownerDocument/namespaceURI
interface CreatorContext {
  ownerDocument?: Document
  document?: Document
  namespaceURI?: string | null
}

function creatorInherit(name: string): (this: CreatorContext) => Element {
  return function (this: CreatorContext): Element {
    const doc = this.ownerDocument || this.document || document
    const uri = this.namespaceURI
    return uri === xhtml && doc.documentElement.namespaceURI === xhtml
      ? doc.createElement(name)
      : uri
        ? doc.createElementNS(uri, name)
        : doc.createElement(name)
  }
}

function creatorFixed(fullname: NamespaceLocal): (this: CreatorContext) => Element {
  return function (this: CreatorContext): Element {
    return (this.ownerDocument || this.document || document).createElementNS(fullname.space, fullname.local)
  }
}

export default function creator(name: string): (this: CreatorContext) => Element {
  const fullname = namespace(name)
  return (typeof fullname === 'object' ? creatorFixed : creatorInherit)(fullname as NamespaceLocal & string)
}

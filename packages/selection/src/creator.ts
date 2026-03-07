import namespace from './namespace.ts'
import type { NamespaceLocal } from './namespace.ts'
import { xhtml } from './namespaces.ts'

function creatorInherit(name: string): (this: any) => Element {
  return function (this: any): Element {
    const doc = this.ownerDocument || this.document || document
    const uri = this.namespaceURI
    return uri === xhtml && doc.documentElement.namespaceURI === xhtml
      ? doc.createElement(name)
      : uri
        ? doc.createElementNS(uri, name)
        : doc.createElement(name)
  }
}

function creatorFixed(fullname: NamespaceLocal): (this: any) => Element {
  return function (this: any): Element {
    return (this.ownerDocument || this.document || document).createElementNS(fullname.space, fullname.local)
  }
}

export default function creator(name: string): (this: any) => Element {
  const fullname = namespace(name)
  return (typeof fullname === 'object' ? creatorFixed : creatorInherit)(fullname as any)
}

export default function window(node: Node | Window | Document): Window & typeof globalThis {
  return ((node as Node).ownerDocument && (node as Node).ownerDocument!.defaultView)! // node is a Node
    || ((node as Window & typeof globalThis).document && node) // node is a Window
    || (node as Document).defaultView // node is a Document
}

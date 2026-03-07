export default function window(node: any): Window & typeof globalThis {
  return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
    || (node.document && node) // node is a Window
    || node.defaultView // node is a Document
}

let nextId = 0

// D3 locals store values as expando properties on DOM nodes
type D3LocalNode = Node & Record<string, unknown>

export class Local<T = unknown> {
  _: string

  constructor() {
    this._ = '@' + (++nextId).toString(36)
  }

  get(node: Node): T | undefined {
    const id = this._
    let current: D3LocalNode | null = node as D3LocalNode
    while (current && !(id in current)) current = current.parentNode as D3LocalNode | null
    return current ? current[id] as T : undefined
  }

  set(node: Node, value: T): T {
    return (node as D3LocalNode)[this._] = value as T
  }

  remove(node: Node): boolean {
    const n = node as D3LocalNode
    return this._ in n && delete n[this._]
  }

  toString(): string {
    return this._
  }
}

export default function local<T = unknown>(): Local<T> {
  return new Local<T>()
}

let nextId = 0

export class Local<T = any> {
  _: string

  constructor() {
    this._ = '@' + (++nextId).toString(36)
  }

  get(node: any): T | undefined {
    const id = this._
    while (!(id in node)) if (!(node = node.parentNode)) return undefined
    return node[id]
  }

  set(node: any, value: T): T {
    return node[this._] = value
  }

  remove(node: any): boolean {
    return this._ in node && delete node[this._]
  }

  toString(): string {
    return this._
  }
}

export default function local<T = any>(): Local<T> {
  return new Local<T>()
}

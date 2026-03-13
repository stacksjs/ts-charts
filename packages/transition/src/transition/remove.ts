interface TransitionNodeExpando extends Element {
  __transition?: Record<number | string, unknown>
}

function removeFunction(id: number): () => void {
  return function (this: Element): void {
    const tNode = this as TransitionNodeExpando
    const parent = this.parentNode
    for (const i in tNode.__transition) if (+i !== id) return
    if (parent) parent.removeChild(this)
  }
}

// eslint-disable-next-line pickier/no-unused-vars
export default function (this: { _id: number; on: Function }): unknown {
  return this.on('end.remove', removeFunction(this._id))
}

function removeFunction(id: number): () => void {
  return function (this: any): void {
    const parent = this.parentNode
    for (const i in this.__transition) if (+i !== id) return
    if (parent) parent.removeChild(this)
  }
}

export default function (this: any): any {
  return this.on('end.remove', removeFunction(this._id))
}

function length(array: any): number {
  return array.length | 0
}

function empty(length: number): boolean {
  return !(length > 0)
}

function arrayify(values: any): any {
  return typeof values !== 'object' || 'length' in values ? values : Array.from(values)
}

function reducer(reduce: (...args: any[]) => any): (values: any[]) => any {
  return (values: any[]) => reduce(...values)
}

export default function cross(...values: any[]): any[] {
  const reduce = typeof values[values.length - 1] === 'function' && reducer(values.pop())
  values = values.map(arrayify)
  const lengths = values.map(length)
  const j = values.length - 1
  const index = new Array(j + 1).fill(0)
  const product: any[] = []
  if (j < 0 || lengths.some(empty)) return product
  while (true) {
    product.push(index.map((j, i) => values[i][j]))
    let i = j
    while (++index[i] === lengths[i]) {
      if (i === 0) return reduce ? product.map(reduce) : product
      index[i--] = 0
    }
  }
}

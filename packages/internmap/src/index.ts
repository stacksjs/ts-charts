function keyof(value: unknown): unknown {
  return value !== null && typeof value === 'object' ? (value as { valueOf(): unknown }).valueOf() : value
}

function intern_get({ _intern, _key }: { _intern: Map<unknown, unknown>, _key: (value: unknown) => unknown }, value: unknown): unknown {
  const key = _key(value)
  return _intern.has(key) ? _intern.get(key) : value
}

function intern_set({ _intern, _key }: { _intern: Map<unknown, unknown>, _key: (value: unknown) => unknown }, value: unknown): unknown {
  const key = _key(value)
  if (_intern.has(key)) return _intern.get(key)
  _intern.set(key, value)
  return value
}

function intern_delete({ _intern, _key }: { _intern: Map<unknown, unknown>, _key: (value: unknown) => unknown }, value: unknown): unknown {
  const key = _key(value)
  if (_intern.has(key)) {
    value = _intern.get(key)
    _intern.delete(key)
  }
  return value
}

export class InternMap<K = unknown, V = unknown> extends Map<K, V> {
  _intern: Map<unknown, K>
  _key: (value: unknown) => unknown

  constructor(entries?: Iterable<[K, V]> | null, key: (value: unknown) => unknown = keyof) {
    super()
    this._intern = new Map()
    this._key = key
    if (entries != null) for (const [key, value] of entries) this.set(key, value)
  }

  get(key: K): V | undefined {
    return super.get(intern_get(this, key) as K)
  }

  has(key: K): boolean {
    return super.has(intern_get(this, key) as K)
  }

  set(key: K, value: V): this {
    return super.set(intern_set(this, key) as K, value)
  }

  delete(key: K): boolean {
    return super.delete(intern_delete(this, key) as K)
  }
}

export class InternSet<T = unknown> extends Set<T> {
  _intern: Map<unknown, T>
  _key: (value: unknown) => unknown

  constructor(values?: Iterable<T> | null, key: (value: unknown) => unknown = keyof) {
    super()
    this._intern = new Map()
    this._key = key
    if (values != null) for (const value of values) this.add(value)
  }

  has(value: T): boolean {
    return super.has(intern_get(this, value) as T)
  }

  add(value: T): this {
    return super.add(intern_set(this, value) as T)
  }

  delete(value: T): boolean {
    return super.delete(intern_delete(this, value) as T)
  }
}

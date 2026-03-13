interface CallbackEntry {
  name: string
  value: (...args: unknown[]) => void
}

const noop: CallbackEntry = { name: '', value: () => {} }

type TypeMap = Record<string, CallbackEntry[]>

interface ParsedTypename {
  // eslint-disable-next-line pickier/no-unused-vars
  type: string
  name: string
}

function parseTypenames(typenames: string, types: TypeMap): ParsedTypename[] {
  return typenames.trim().split(/^|\s+/).map((t) => {
    let name = ''
    const i = t.indexOf('.')
    if (i >= 0) {
      name = t.slice(i + 1)
      t = t.slice(0, i)
    }
    // eslint-disable-next-line pickier/no-unused-vars
    if (t && !types.hasOwnProperty(t)) throw new Error(`unknown type: ${t}`)
    return { type: t, name }
  })
}

function get(type: CallbackEntry[], name: string): ((...args: unknown[]) => void) | undefined {
  for (let i = 0, n = type.length; i < n; ++i) {
    const c = type[i]
    if (c.name === name) {
      return c.value
    }
  }
}

function set(type: CallbackEntry[], name: string, callback: ((...args: unknown[]) => void) | null): CallbackEntry[] {
  for (let i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop
      type = type.slice(0, i).concat(type.slice(i + 1))
      break
    }
  }
  if (callback != null) type.push({ name, value: callback })
  return type
}

export class Dispatch {
  _: TypeMap

  constructor(types: TypeMap) {
    this._ = types
  }

  on(typename: string, callback?: ((...args: unknown[]) => void) | null): this | ((...args: unknown[]) => void) | undefined {
    // eslint-disable-next-line pickier/no-unused-vars
    const T = parseTypenames(`${typename}`, this._)
    let t: string | undefined
    let i = -1
    const n = T.length

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) {
        t = T[i].type
        if (t) {
          const found = get(this._[t], T[i].name)
          if (found) return found
        }
      }
      return
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    // eslint-disable-next-line pickier/no-unused-vars
    if (callback != null && typeof callback !== 'function') throw new Error(`invalid callback: ${callback}`)
    while (++i < n) {
      const parsed = T[i]
      if ((t = parsed.type)) {
        this._[t] = set(this._[t], parsed.name, callback ?? null)
      // eslint-disable-next-line pickier/no-unused-vars
      }
      else if (callback == null) {
        for (t in this._) {
          this._[t] = set(this._[t], parsed.name, null)
        }
      }
    }

    return this
  }

  copy(): Dispatch {
    const copy: TypeMap = {}
    for (const t in this._) copy[t] = this._[t].slice()
    return new Dispatch(copy)
  }

  call(type: string, that?: unknown, ...args: unknown[]): void {
    // eslint-disable-next-line pickier/no-unused-vars
    if (!this._.hasOwnProperty(type)) throw new Error(`unknown type: ${type}`)
    const t = this._[type]
    for (let i = 0, n = t.length; i < n; ++i) {
      t[i].value.apply(that, args)
    }
  }

  apply(type: string, that?: unknown, args?: unknown[]): void {
    // eslint-disable-next-line pickier/no-unused-vars
    if (!this._.hasOwnProperty(type)) throw new Error(`unknown type: ${type}`)
    const t = this._[type]
    for (let i = 0, n = t.length; i < n; ++i) {
      t[i].value.apply(that, args as unknown[])
    }
  }

  static [Symbol.hasInstance](value: unknown): boolean {
    return (value != null
      && typeof value === 'object'
      && Object.getPrototypeOf(value) === Dispatch.prototype)
  }
}

export function dispatch(...types: string[]): Dispatch {
  const _ : TypeMap = {}
  for (let i = 0, n = types.length; i < n; ++i) {
    const t = `${types[i]}`
    // eslint-disable-next-line pickier/no-unused-vars
    if (!t || (t in _) || /[\s.]/.test(t)) throw new Error(`illegal type: ${t}`)
    _[t] = []
  }
  return new Dispatch(_)
}

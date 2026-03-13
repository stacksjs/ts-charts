// D3 scales are callable functions with methods attached.
// Using Record<string, any> to accommodate the dynamic getter/setter API.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InitableScale = Record<string, any>

export function initRange(this: InitableScale, domain?: unknown, range?: unknown): InitableScale {
  switch (arguments.length) {
    case 0: break
    // eslint-disable-next-line pickier/no-unused-vars
    case 1: this.range(domain)
      break
    // eslint-disable-next-line pickier/no-unused-vars
    default: this.range(range).domain(domain)
      break
  }
  return this
}

export function initInterpolator(this: InitableScale, domain?: unknown, interpolator?: unknown): InitableScale {
  switch (arguments.length) {
    case 0: break
    case 1: {
      if (typeof domain === 'function') this.interpolator(domain)
      else this.range(domain)
      break
    }
    default: {
      this.domain(domain)
      if (typeof interpolator === 'function') this.interpolator(interpolator)
      else this.range(interpolator)
      break
    }
  }
  return this
}

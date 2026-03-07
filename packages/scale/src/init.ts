export function initRange(this: any, domain?: any, range?: any): any {
  switch (arguments.length) {
    case 0: break
    case 1: this.range(domain); break
    default: this.range(range).domain(domain); break
  }
  return this
}

export function initInterpolator(this: any, domain?: any, interpolator?: any): any {
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

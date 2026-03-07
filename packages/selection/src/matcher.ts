export default function matcher(selector: string): (this: Element) => boolean {
  return function (this: Element): boolean {
    return this.matches(selector)
  }
}

export function childMatcher(selector: string): (node: Element) => boolean {
  return function (node: Element): boolean {
    return node.matches(selector)
  }
}

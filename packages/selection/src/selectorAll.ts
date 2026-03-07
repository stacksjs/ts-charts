function empty(): never[] {
  return []
}

export default function selectorAll(selector: string | null | undefined): (this: Element) => NodeListOf<Element> | never[] {
  return selector == null
    ? empty
    : function (this: Element): NodeListOf<Element> {
        return this.querySelectorAll(selector!)
      }
}

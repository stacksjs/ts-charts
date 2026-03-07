function empty(): never[] {
  return []
}

export default function selectorAll(selector: string | null | undefined): (this: Element) => Element[] | NodeListOf<Element> {
  return selector == null
    ? empty
    : function (this: Element): NodeListOf<Element> {
        return this.querySelectorAll(selector!)
      }
}

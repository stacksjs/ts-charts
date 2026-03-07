function none(): undefined {
  return undefined
}

export default function selector(selector: string | null | undefined): (this: Element) => Element | undefined {
  return selector == null
    ? none
    : function (this: Element): Element | undefined {
        return this.querySelector(selector!) || undefined
      }
}

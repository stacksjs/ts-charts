export function nopropagation(event: any): void {
  event.stopImmediatePropagation()
}

export default function noevent(event: any): void {
  event.preventDefault()
  event.stopImmediatePropagation()
}

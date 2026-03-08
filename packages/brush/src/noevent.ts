export function nopropagation(event: Event): void {
  event.stopImmediatePropagation()
}

export default function noevent(event: Event): void {
  event.preventDefault()
  event.stopImmediatePropagation()
}

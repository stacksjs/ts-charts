// These are typically used in conjunction with noevent to ensure that we can
// preventDefault on the event.
export const nonpassive = { passive: false }
export const nonpassivecapture = { capture: true, passive: false }

export function nopropagation(event: Event): void {
  event.stopImmediatePropagation()
}

export default function noevent(event: Event): void {
  event.preventDefault()
  event.stopImmediatePropagation()
}

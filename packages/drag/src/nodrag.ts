import { select } from '@ts-charts/selection'
import noevent, { nonpassivecapture } from './noevent.ts'

export default function nodrag(view: any): void {
  const root = view.document.documentElement
  const selection = select(view).on('dragstart.drag', noevent, nonpassivecapture)
  if ('onselectstart' in root) {
    selection.on('selectstart.drag', noevent, nonpassivecapture)
  // eslint-disable-next-line pickier/no-unused-vars
  } else {
    root.__noselect = root.style.MozUserSelect
    root.style.MozUserSelect = 'none'
  }
}

export function yesdrag(view: any, noclick: boolean): void {
  const root = view.document.documentElement
  const selection = select(view).on('dragstart.drag', null)
  if (noclick) {
    selection.on('click.drag', noevent, nonpassivecapture)
    setTimeout(function () { selection.on('click.drag', null) }, 0)
  }
  if ('onselectstart' in root) {
    selection.on('selectstart.drag', null)
  // eslint-disable-next-line pickier/no-unused-vars
  } else {
    root.style.MozUserSelect = root.__noselect
    delete root.__noselect
  }
}

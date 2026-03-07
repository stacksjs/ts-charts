import { describe, it, expect } from 'bun:test'
import { select } from '../../src/index.ts'

describe('selection.join', () => {
  it('selection.join(name) enter-appends elements', () => {
    document.body.innerHTML = ''
    let p = select(document.body).selectAll('p')
    p = p.data([1, 3]).join('p').text((d: any) => d)
    expect(document.body.innerHTML).toBe('<p>1</p><p>3</p>')
    document.body.innerHTML = ''
  })

  it('selection.join(name) exit-removes elements', () => {
    document.body.innerHTML = '<p>1</p><p>2</p><p>3</p>'
    let p = select(document.body).selectAll('p')
    p = p.data([1, 3]).join('p').text((d: any) => d)
    expect(document.body.innerHTML).toBe('<p>1</p><p>3</p>')
    document.body.innerHTML = ''
  })

  it('selection.join(enter, update, exit) calls the specified functions', () => {
    document.body.innerHTML = '<p>1</p><p>2</p>'
    let p = select(document.body).selectAll('p').datum(function (this: any) { return this.textContent })
    p = p.data([1, 3], (d: any) => d).join(
      (enter: any) => enter.append('p').attr('class', 'enter').text((d: any) => d),
      (update: any) => update.attr('class', 'update'),
      (exit: any) => exit.attr('class', 'exit'),
    )
    expect(document.body.innerHTML).toBe('<p class="update">1</p><p class="exit">2</p><p class="enter">3</p>')
    document.body.innerHTML = ''
  })

  it('selection.join(...) reorders nodes to match the data', () => {
    document.body.innerHTML = ''
    let p = select(document.body).selectAll('p')
    p = p.data([1, 3], (d: any) => d).join((enter: any) => enter.append('p').text((d: any) => d))
    expect(document.body.innerHTML).toBe('<p>1</p><p>3</p>')
    p = p.data([0, 3, 1, 2, 4], (d: any) => d).join((enter: any) => enter.append('p').text((d: any) => d))
    expect(document.body.innerHTML).toBe('<p>0</p><p>3</p><p>1</p><p>2</p><p>4</p>')
    document.body.innerHTML = ''
  })

  it('selection.join(enter, update, exit) allows callbacks to return a transition', () => {
    document.body.innerHTML = '<p>1</p><p>2</p>'
    let p = select(document.body).selectAll('p').datum(function (this: any) { return this.textContent })
    p = p.data([1, 3], (d: any) => d).join(
      (enter: any) => mockTransition(enter.append('p').attr('class', 'enter').text((d: any) => d)),
      (update: any) => mockTransition(update.attr('class', 'update')),
      (exit: any) => mockTransition(exit.attr('class', 'exit')),
    )
    expect(document.body.innerHTML).toBe('<p class="update">1</p><p class="exit">2</p><p class="enter">3</p>')
    document.body.innerHTML = ''
  })
})

function mockTransition(sel: any): any {
  return {
    selection() {
      return sel
    },
  }
}

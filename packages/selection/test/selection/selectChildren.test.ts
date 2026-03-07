import { describe, it, expect } from 'bun:test'
import { select, Selection } from '../../src/index.ts'
import { assertSelection } from '../asserts.ts'

describe('selection.selectChild', () => {
  it('select.selectChild(...) selects the first (matching) child', () => {
    document.body.innerHTML = '<h1><span>hello</span>, <span>world<span>!</span></span></h1>'
    const s = select(document).select('h1')
    expect(s.selectChild(() => true) instanceof Selection).toBe(true)
    assertSelection(s.selectChild(() => true), s.select('*'))
    expect(s.selectChild() instanceof Selection).toBe(true)
    expect(s.selectChild('*') instanceof Selection).toBe(true)
    assertSelection(s.selectChild('*'), s.select('*'))
    assertSelection(s.selectChild(), s.select('*'))
    assertSelection(s.selectChild('div'), s.select('div'))
    expect(s.selectChild('span').text()).toBe('hello')
    document.body.innerHTML = ''
  })

  it('selectAll.selectChild(...) selects the first (matching) child', () => {
    document.body.innerHTML = '<div><span>hello</span>, <span>world<span>!</span></span></div><div><span>hello2</span>, <span>world2<span>!2</span></span></div>'
    const s = select(document).selectAll('div')
    expect(s.selectChild(() => true) instanceof Selection).toBe(true)
    assertSelection(s.selectChild(() => true), s.select('*'))
    expect(s.selectChild() instanceof Selection).toBe(true)
    expect(s.selectChild('*') instanceof Selection).toBe(true)
    assertSelection(s.selectChild('*'), s.select('*'))
    assertSelection(s.selectChild(), s.select('*'))
    assertSelection(s.selectChild('div'), s.select('div'))
    expect(s.selectChild('span').text()).toBe('hello')
    document.body.innerHTML = ''
  })
})

describe('selection.selectChildren', () => {
  it('select.selectChildren(...) selects the matching children', () => {
    document.body.innerHTML = '<h1><span>hello</span>, <span>world<span>!</span></span></h1>'
    const s = select(document).select('h1')
    expect(s.selectChildren('*') instanceof Selection).toBe(true)
    expect(s.selectChildren('*').text()).toBe('hello')
    expect(s.selectChildren().size()).toBe(2)
    expect(s.selectChildren('*').size()).toBe(2)
    assertSelection(s.selectChildren(), s.selectChildren('*'))
    expect(s.selectChildren('span').size()).toBe(2)
    expect(s.selectChildren('div').size()).toBe(0)
    document.body.innerHTML = ''
  })

  it('selectAll.selectChildren(...) selects the matching children', () => {
    document.body.innerHTML = '<div><span>hello</span>, <span>world<span>!</span></span></div><div><span>hello2</span>, <span>world2<span>!2</span></span></div>'
    const s = select(document).selectAll('div')
    expect(s.selectChildren('*') instanceof Selection).toBe(true)
    expect(s.selectChildren('*').text()).toBe('hello')
    expect(s.selectChildren().size()).toBe(4)
    expect(s.selectChildren('*').size()).toBe(4)
    assertSelection(s.selectChildren(), s.selectChildren('*'))
    expect(s.selectChildren('span').size()).toBe(4)
    expect(s.selectChildren('div').size()).toBe(0)
    document.body.innerHTML = ''
  })
})

import { describe, it, expect } from 'bun:test'

describe('debug', () => {
  it('insertBefore workaround', () => {
    document.body.innerHTML = '<a></a><b></b><c></c>'
    const a = document.querySelector('a')!
    const c = document.querySelector('c')!
    
    // Workaround: remove first, then insertBefore
    const parent = a.parentNode!
    parent.removeChild(a)
    parent.insertBefore(a, c)
    console.log('after remove+insertBefore(a, c):', document.body.innerHTML)
  })
})

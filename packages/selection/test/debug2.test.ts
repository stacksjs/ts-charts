import { describe, it, expect } from 'bun:test'

describe('debug', () => {
  it('matches bug', () => {
    document.body.innerHTML = '<span id="one"></span><span id="three"></span>'
    const three = document.querySelector('#three')!
    console.log('three matches #three:', three.matches('#three'))
    console.log('three matches #one,#three:', three.matches('#one,#three'))
    console.log('three matches #three,#one:', three.matches('#three,#one'))
  })
})

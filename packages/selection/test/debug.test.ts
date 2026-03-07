import { test, expect } from 'bun:test'

test('debug', () => {
  console.log('createElementNS:', typeof document.createElementNS)
  console.log('createElement:', typeof document.createElement)
  const h1 = document.createElement('h1')
  console.log('h1 ns:', h1.namespaceURI)
  console.log('h1 tagName:', h1.tagName)
  if (typeof document.createElementNS === 'function') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    console.log('svg ns:', svg.namespaceURI)
    console.log('svg tagName:', svg.tagName)
  }
})

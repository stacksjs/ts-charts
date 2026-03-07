import { describe, it, expect } from 'bun:test'
import { symbols, symbolsFill, symbolsStroke, symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye, symbolPlus, symbolTimes, symbolTriangle2, symbolAsterisk, symbolSquare2, symbolDiamond2 } from '../src/index.ts'

it('symbols is a deprecated alias for symbolsFill', () => {
  expect(symbols).toBe(symbolsFill)
})

it('symbolsFill is the array of symbol types', () => {
  expect(symbolsFill).toEqual([
    symbolCircle,
    symbolCross,
    symbolDiamond,
    symbolSquare,
    symbolStar,
    symbolTriangle,
    symbolWye,
  ])
})

it('symbolsStroke is the array of symbol types', () => {
  expect(symbolsStroke).toEqual([
    symbolCircle,
    symbolPlus,
    symbolTimes,
    symbolTriangle2,
    symbolAsterisk,
    symbolSquare2,
    symbolDiamond2,
  ])
})

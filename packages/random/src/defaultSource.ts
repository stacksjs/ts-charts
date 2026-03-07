export type RandomSource = () => number

const defaultSource: RandomSource = Math.random

export default defaultSource

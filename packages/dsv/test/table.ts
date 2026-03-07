import type { DSVParsedArray } from '../src/index.ts'

export function table<T>(rows: T[], columns: string[]): DSVParsedArray<T> {
  const result = rows as DSVParsedArray<T>
  result.columns = columns
  return result
}

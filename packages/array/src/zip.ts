import transpose from './transpose.ts'

export default function zip(...arrays: any[][]): any[][] {
  return transpose(arrays)
}

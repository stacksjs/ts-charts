const array = Array.prototype

export const slice: <T>(this: T[], start?: number, end?: number) => T[] = array.slice
export const map: <T, U>(this: T[], callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: unknown) => U[] = array.map

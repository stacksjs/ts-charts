function* flatten(arrays: Iterable<Iterable<any>>): Generator<any> {
  for (const array of arrays) {
    yield* array
  }
}

export default function merge(arrays: Iterable<Iterable<any>>): any[] {
  return Array.from(flatten(arrays))
}

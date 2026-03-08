export default function sparse(update: ArrayLike<unknown>): Array<undefined> {
  return new Array(update.length)
}

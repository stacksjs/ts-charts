const constant = (x: unknown): (() => unknown) => () => x

export default constant

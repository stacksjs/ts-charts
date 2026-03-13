export interface QuadtreeLeaf<T> {
  data: T
  next?: QuadtreeLeaf<T>
}

export type QuadtreeInternalNode<T> = [
  // eslint-disable-next-line pickier/no-unused-vars
  QuadtreeNode<T> | undefined,
  QuadtreeNode<T> | undefined,
  QuadtreeNode<T> | undefined,
  QuadtreeNode<T> | undefined,
] & { length: 4 }

export type QuadtreeNode<T> = QuadtreeLeaf<T> | QuadtreeInternalNode<T>

export type QuadtreeNodeCallback<T> = (
  node: QuadtreeNode<T>,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) => boolean | void

// eslint-disable-next-line pickier/no-unused-vars
export type Accessor<T> = (d: T) => number

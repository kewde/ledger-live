export type UnionToIntersection<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never;

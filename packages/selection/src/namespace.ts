import namespaces from './namespaces.ts'

export interface NamespaceLocal {
  space: string
  local: string
}

export default function namespace(name: string): NamespaceLocal | string {
  let prefix: string = name = name + ''
  const i = prefix.indexOf(':')
  if (i >= 0 && (prefix = name.slice(0, i)) !== 'xmlns') name = name.slice(i + 1)
  // eslint-disable-next-line no-prototype-builtins
  return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name
}

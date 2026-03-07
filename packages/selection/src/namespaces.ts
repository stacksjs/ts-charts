export const xhtml: string = 'http://www.w3.org/1999/xhtml'

export interface Namespaces {
  [key: string]: string
  svg: string
  xhtml: string
  xlink: string
  xml: string
  xmlns: string
}

const namespaces: Namespaces = {
  svg: 'http://www.w3.org/2000/svg',
  xhtml,
  xlink: 'http://www.w3.org/1999/xlink',
  xml: 'http://www.w3.org/XML/1998/namespace',
  xmlns: 'http://www.w3.org/2000/xmlns/',
}

export default namespaces

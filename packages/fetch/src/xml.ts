import text from './text'

function parser(type: DOMParserSupportedType): (input: RequestInfo | URL, init?: RequestInit) => Promise<Document> {
  return (input: RequestInfo | URL, init?: RequestInit): Promise<Document> => text(input, init)
    .then((text: string): Document => (new DOMParser()).parseFromString(text, type))
}

const xml: (input: RequestInfo | URL, init?: RequestInit) => Promise<Document> = parser('application/xml')
export default xml

export const html: (input: RequestInfo | URL, init?: RequestInit) => Promise<Document> = parser('text/html')

export const svg: (input: RequestInfo | URL, init?: RequestInit) => Promise<Document> = parser('image/svg+xml')

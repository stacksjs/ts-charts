function responseArrayBuffer(response: Response): Promise<ArrayBuffer> {
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.arrayBuffer()
}

export default function buffer(input: RequestInfo | URL, init?: RequestInit): Promise<ArrayBuffer> {
  return fetch(input, init).then(responseArrayBuffer)
}

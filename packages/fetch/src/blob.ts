function responseBlob(response: Response): Promise<Blob> {
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.blob()
}

export default function blob(input: RequestInfo | URL, init?: RequestInit): Promise<Blob> {
  return fetch(input, init).then(responseBlob)
}

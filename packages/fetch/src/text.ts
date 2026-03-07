function responseText(response: Response): Promise<string> {
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.text()
}

export default function text(input: RequestInfo | URL, init?: RequestInit): Promise<string> {
  return fetch(input, init).then(responseText)
}

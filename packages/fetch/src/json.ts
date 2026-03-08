function responseJson<T>(response: Response): Promise<T> | undefined {
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  if (response.status === 204 || response.status === 205) return undefined
  return response.json() as Promise<T>
}

export default function json<T = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<T | undefined> {
  return fetch(input, init).then(responseJson) as Promise<T | undefined>
}

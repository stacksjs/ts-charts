export default function image(input: string, init?: Record<string, unknown>): Promise<HTMLImageElement> {
  return new Promise(function (resolve: (value: HTMLImageElement) => void, reject: (reason?: unknown) => void) {
    const image = new Image()
    if (init) for (const key in init) (image as unknown as Record<string, unknown>)[key] = init[key]
    image.onerror = reject
    image.onload = function (): void { resolve(image) }
    image.src = input
  })
}

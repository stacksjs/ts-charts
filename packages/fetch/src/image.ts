export default function image(input: string, init?: Record<string, any>): Promise<HTMLImageElement> {
  return new Promise(function (resolve: (value: HTMLImageElement) => void, reject: (reason?: any) => void) {
    const image = new Image()
    if (init) for (const key in init) (image as any)[key] = init[key]
    image.onerror = reject
    image.onload = function (): void { resolve(image) }
    image.src = input
  })
}

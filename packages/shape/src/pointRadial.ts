export default function pointRadial(x: number, y: number): [number, number] {
  return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)]
}

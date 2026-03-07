export default function jiggle(random: () => number): number {
  return (random() - 0.5) * 1e-6
}

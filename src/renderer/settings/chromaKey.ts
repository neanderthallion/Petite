const TOLERANCE = 40 // RGB Euclidean distance below which a pixel is fully transparent
const FALLOFF = 25 // extra distance band for a soft linear alpha ramp, avoids jagged edges
const BORDER_SAMPLE_STEP = 4 // sample every Nth pixel along each edge to estimate the background color

/** Mutates imageData in place: punches out pixels close to the estimated flat background color. */
export function applyChromaKey(imageData: ImageData): void {
  const { data, width, height } = imageData

  const at = (x: number, y: number): [number, number, number] => {
    const i = (y * width + x) * 4
    return [data[i], data[i + 1], data[i + 2]]
  }

  const samples: [number, number, number][] = []
  for (let x = 0; x < width; x += BORDER_SAMPLE_STEP) {
    samples.push(at(x, 0), at(x, height - 1))
  }
  for (let y = 0; y < height; y += BORDER_SAMPLE_STEP) {
    samples.push(at(0, y), at(width - 1, y))
  }

  const sum = samples.reduce<[number, number, number]>(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0]
  )
  const bg: [number, number, number] = [sum[0] / samples.length, sum[1] / samples.length, sum[2] / samples.length]

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    const dist = Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)

    let mult: number
    if (dist <= TOLERANCE) mult = 0
    else if (dist >= TOLERANCE + FALLOFF) mult = 1
    else mult = (dist - TOLERANCE) / FALLOFF

    data[i + 3] = Math.round(a * mult)
  }
}

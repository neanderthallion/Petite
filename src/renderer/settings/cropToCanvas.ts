export const CROPPED_SIZE = 500

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

/** Rasterizes the given source-pixel crop rect onto a fresh CROPPED_SIZE square canvas. */
export async function cropToCanvas(imageSrc: string, area: CropRect): Promise<HTMLCanvasElement> {
  const img = new Image()
  img.src = imageSrc
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load image for cropping'))
  })

  const canvas = document.createElement('canvas')
  canvas.width = CROPPED_SIZE
  canvas.height = CROPPED_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, CROPPED_SIZE, CROPPED_SIZE)
  return canvas
}

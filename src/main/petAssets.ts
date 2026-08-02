import { app, nativeImage, net, protocol } from 'electron'
import { randomUUID } from 'crypto'
import { mkdir, rm, writeFile } from 'fs/promises'
import { join, resolve, sep } from 'path'
import { pathToFileURL } from 'url'

const ID_RE = /^[a-zA-Z0-9_-]+$/
const FILE_RE = /^[a-zA-Z0-9_-]+\.png$/

function petsRoot(): string {
  return join(app.getPath('userData'), 'pets')
}

/**
 * Serves user-uploaded pose images to the renderer. A registered scheme (rather
 * than raw file:// paths) is required because the dev renderer loads over
 * http://localhost (Vite), and Chromium blocks local file:// loads from a
 * non-file origin — this keeps image loading identical in dev and packaged builds.
 * Must be called before app 'ready' (i.e. before requestSingleInstanceLock()).
 */
export function registerPetAssetScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'petasset',
      privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true }
    }
  ])
}

/** Call inside app.whenReady(). Serves petasset://<petId>/<file>.png from userData/pets/. */
export function registerPetAssetProtocolHandler(): void {
  protocol.handle('petasset', async (request) => {
    const url = new URL(request.url)
    const petId = url.hostname
    const fileName = decodeURIComponent(url.pathname).replace(/^\//, '')

    if (!ID_RE.test(petId) || !FILE_RE.test(fileName)) {
      return new Response('Invalid asset path', { status: 400 })
    }

    const root = resolve(petsRoot())
    const filePath = resolve(join(root, petId, fileName))
    if (!filePath.startsWith(root + sep)) {
      return new Response('Forbidden', { status: 403 })
    }

    try {
      return await net.fetch(pathToFileURL(filePath).toString())
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })
}

/** Decodes+validates a picked file's bytes before ever handing it to the renderer. */
export function readPickedImageAsDataUrl(
  buffer: Buffer,
  mime: string
): { dataUrl: string } | { error: 'unreadable' } {
  const image = nativeImage.createFromBuffer(buffer)
  if (image.isEmpty()) return { error: 'unreadable' }
  return { dataUrl: `data:${mime};base64,${buffer.toString('base64')}` }
}

/** Persists an already cropped/resized/chroma-keyed PNG (as a data URL) for a pet. */
export async function savePoseImage(petId: string, pngDataUrl: string): Promise<{ pose: string }> {
  const match = /^data:image\/png;base64,(.+)$/.exec(pngDataUrl)
  if (!match) throw new Error('Expected a PNG data URL')

  const buffer = Buffer.from(match[1], 'base64')
  const image = nativeImage.createFromBuffer(buffer)
  if (image.isEmpty()) throw new Error('Decoded image is empty/corrupt')

  const dir = join(petsRoot(), petId)
  await mkdir(dir, { recursive: true })
  const fileName = `${randomUUID()}.png`
  await writeFile(join(dir, fileName), buffer)

  return { pose: `petasset://${petId}/${fileName}` }
}

export async function deletePoseFile(pose: string): Promise<void> {
  if (!pose.startsWith('petasset://')) return // built-in relative-filename pose: nothing on disk to remove
  const url = new URL(pose)
  const filePath = join(petsRoot(), url.hostname, decodeURIComponent(url.pathname).replace(/^\//, ''))
  await rm(filePath, { force: true })
}

export async function deletePetDirectory(petId: string): Promise<void> {
  await rm(join(petsRoot(), petId), { recursive: true, force: true })
}

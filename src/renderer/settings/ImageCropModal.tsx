import { useEffect, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { SPRITE_SIZE } from '../../shared/spriteConfig'
import { cropToCanvas } from './cropToCanvas'
import { applyChromaKey } from './chromaKey'

type Step =
  | { kind: 'picking' }
  | { kind: 'unreadable' }
  | { kind: 'cropping'; dataUrl: string; isPng: boolean }
  | { kind: 'previewing'; canvas: HTMLCanvasElement }
  | { kind: 'saving'; canvas: HTMLCanvasElement }

export default function ImageCropModal(props: {
  petId: string
  onClose: () => void
  onSaved: (pose: string) => void
}): JSX.Element {
  const { petId, onClose, onSaved } = props

  const [step, setStep] = useState<Step>({ kind: 'picking' })
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  useEffect(() => {
    let cancelled = false
    window.petite.pickImage().then((result) => {
      if (cancelled) return
      if (result.canceled) {
        onClose()
        return
      }
      if ('error' in result) {
        setStep({ kind: 'unreadable' })
        return
      }
      setStep({ kind: 'cropping', dataUrl: result.dataUrl, isPng: /\.png$/i.test(result.fileName) })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const confirmCrop = async (): Promise<void> => {
    if (step.kind !== 'cropping' || !croppedAreaPixels) return
    const canvas = await cropToCanvas(step.dataUrl, croppedAreaPixels)
    if (step.isPng) {
      const ctx = canvas.getContext('2d')!
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      applyChromaKey(imageData)
      ctx.putImageData(imageData, 0, 0)
    }
    setStep({ kind: 'previewing', canvas })
  }

  const save = async (): Promise<void> => {
    if (step.kind !== 'previewing') return
    const canvas = step.canvas
    setStep({ kind: 'saving', canvas })
    const { pose } = await window.petite.addPose(petId, canvas.toDataURL('image/png'))
    onSaved(pose)
    onClose()
  }

  return (
    <div className="crop-modal-backdrop" onClick={onClose}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
        {step.kind === 'picking' && <p>Waiting for a file…</p>}

        {step.kind === 'unreadable' && (
          <>
            <p className="field-warning">That file couldn&apos;t be read as an image.</p>
            <div className="crop-modal-actions">
              <button type="button" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}

        {step.kind === 'cropping' && (
          <>
            <div className="crop-container">
              <Cropper
                image={step.dataUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />
            </div>
            <div className="crop-modal-actions">
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="confirm" onClick={confirmCrop} disabled={!croppedAreaPixels}>
                Use this crop
              </button>
            </div>
          </>
        )}

        {(step.kind === 'previewing' || step.kind === 'saving') && (
          <>
            <p>Preview (shown at actual size):</p>
            <div className="crop-preview" style={{ width: SPRITE_SIZE, height: SPRITE_SIZE }}>
              <img
                src={step.canvas.toDataURL('image/png')}
                width={SPRITE_SIZE}
                height={SPRITE_SIZE}
                alt="Cropped pose preview"
              />
            </div>
            <div className="crop-modal-actions">
              <button type="button" onClick={onClose} disabled={step.kind === 'saving'}>
                Discard
              </button>
              <button type="button" className="confirm" onClick={save} disabled={step.kind === 'saving'}>
                {step.kind === 'saving' ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

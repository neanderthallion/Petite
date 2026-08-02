import { useEffect, useState, type CSSProperties } from 'react'
import { PET_SPECIES_CONFIG, randomPoseIndex } from '../../shared/spriteConfig'
import type { TriggerPayload } from '../../shared/types'

const SPRITE_SIZE = 150

export default function App(): JSX.Element | null {
  const [payload, setPayload] = useState<TriggerPayload | null>(null)
  const [poseIndex, setPoseIndex] = useState(0)

  useEffect(() => window.petite.onShowMessage((incoming) => {
    setPayload(incoming)
    setPoseIndex(randomPoseIndex(incoming.species))
  }), [])

  if (!payload) return null

  const { poses } = PET_SPECIES_CONFIG[payload.species]
  // Relative (not "/pet/...") so it still resolves under the file:// URLs
  // used by the packaged/preview build, not just the dev server.
  const spriteStyle: CSSProperties = {
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
    backgroundImage: `url(${poses[poseIndex]})`,
    backgroundSize: 'contain'
  }

  const cyclePose = (): void => setPoseIndex((current) => (current + 1) % poses.length)

  return (
    <div className="pet-stage">
      <div className="bubble">
        <div className="bubble-inner">
          <p>{payload.message}</p>
          <div className="bubble-actions">
            <button onClick={() => window.petite.snooze(payload)}>Snooze</button>
            <button onClick={() => window.petite.dismiss()}>OK</button>
          </div>
        </div>
      </div>
      <div className="sprite" style={spriteStyle} onClick={cyclePose} />
    </div>
  )
}

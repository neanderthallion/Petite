import { useEffect, useState } from 'react'
import type { PetProfile } from '../../shared/types'
import ImageCropModal from './ImageCropModal'
import { resolvePoseUrl } from './resolvePoseUrl'

export default function PetCard(props: { pet: PetProfile; ruleUsageCount: number; onChanged: () => void }): JSX.Element {
  const { pet, ruleUsageCount, onChanged } = props

  const [label, setLabel] = useState(pet.label)
  const [showCropModal, setShowCropModal] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => setLabel(pet.label), [pet.label])

  const commitLabel = (): void => {
    const trimmed = label.trim()
    if (trimmed && trimmed !== pet.label) {
      window.petite.renamePet(pet.id, trimmed).then(onChanged)
    } else {
      setLabel(pet.label)
    }
  }

  const removePose = (pose: string): void => {
    window.petite.deletePose(pet.id, pose).then(onChanged)
  }

  const deletePet = async (): Promise<void> => {
    setDeleteError(null)
    const result = await window.petite.deletePet(pet.id)
    if (result.ok) {
      onChanged()
    } else {
      setDeleteError(`Used by ${result.count} reminder${result.count === 1 ? '' : 's'} — remove or reassign them first.`)
    }
  }

  return (
    <div className="pet-card">
      <div className="pet-header">
        <input
          className="pet-name"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commitLabel}
          placeholder="Pet name"
        />
        <button type="button" className="danger" onClick={deletePet}>
          Delete pet
        </button>
      </div>

      {deleteError && <span className="field-warning">{deleteError}</span>}
      {pet.poses.length === 0 && !deleteError && (
        <span className="field-warning">No pictures yet — this pet won&apos;t appear until you add one.</span>
      )}

      <div className="pet-thumb-strip">
        {pet.poses.map((pose) => (
          <div key={pose} className="pet-thumb-wrap">
            <div className="pet-thumb" style={{ backgroundImage: `url(${resolvePoseUrl(pose)})` }} />
            <button
              type="button"
              className="pet-thumb-remove"
              title="Remove this picture"
              onClick={() => removePose(pose)}
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" className="add-picture" onClick={() => setShowCropModal(true)}>
          + Add picture
        </button>
      </div>

      {ruleUsageCount > 0 && (
        <span className="pet-usage">
          Used by {ruleUsageCount} reminder{ruleUsageCount === 1 ? '' : 's'}
        </span>
      )}

      {showCropModal && (
        <ImageCropModal
          petId={pet.id}
          onClose={() => setShowCropModal(false)}
          onSaved={() => onChanged()}
        />
      )}
    </div>
  )
}

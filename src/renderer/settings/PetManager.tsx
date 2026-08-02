import { useState } from 'react'
import type { MessageRule, PetProfile } from '../../shared/types'
import PetCard from './PetCard'

export default function PetManager(props: {
  pets: PetProfile[]
  rules: MessageRule[]
  onPetsChanged: () => void
}): JSX.Element {
  const { pets, rules, onPetsChanged } = props
  const [newPetName, setNewPetName] = useState('')

  const usageCount = (petId: string): number => rules.filter((r) => r.species === petId).length

  const addPet = (): void => {
    const label = newPetName.trim()
    if (!label) return
    window.petite.addPet(label).then(() => {
      setNewPetName('')
      onPetsChanged()
    })
  }

  return (
    <section className="pet-manager">
      <h2>Pets</h2>
      {pets.length === 0 && <p className="empty-state">No pets yet — add one below.</p>}

      <div className="pet-list">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} ruleUsageCount={usageCount(pet.id)} onChanged={onPetsChanged} />
        ))}
      </div>

      <div className="add-pet-row">
        <input
          value={newPetName}
          onChange={(e) => setNewPetName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPet()}
          placeholder="New pet name"
        />
        <button type="button" className="add-rule" onClick={addPet} disabled={!newPetName.trim()}>
          + Add pet
        </button>
      </div>
    </section>
  )
}

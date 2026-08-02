import type { PetSpecies } from './types'

/**
 * Each pose is a standalone image (not a sprite-sheet strip). Files live in
 * pet/ and are copied as-is into src/renderer/public/pet/ so Vite can serve
 * them; re-copy if you replace the source art.
 */
export interface PetSpeciesConfig {
  label: string
  poses: string[]
}

export const PET_SPECIES_CONFIG: Record<PetSpecies, PetSpeciesConfig> = {
  cat: {
    label: 'Cat',
    poses: ['Cat1.png', 'Cat2.png', 'Cat3.png', 'Cat4.png']
  },
  dog: {
    label: 'Dog',
    poses: ['Dog1.png', 'Dog2.png', 'Dog3.png', 'Dog4.png']
  },
  pokemon: {
    label: 'Pokemon',
    poses: ['Pokemon1.png', 'Pokemon2.png', 'Pokemon3.png', 'Pokemon4.png']
  }
}

export function randomPoseIndex(species: PetSpecies): number {
  const { poses } = PET_SPECIES_CONFIG[species]
  return Math.floor(Math.random() * poses.length)
}

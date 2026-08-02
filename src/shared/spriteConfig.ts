import type { PetProfile } from './types'

/** CSS pixel size the pet sprite renders at (pet/App.tsx) and the crop preview targets (ImageCropModal.tsx). */
export const SPRITE_SIZE = 150

/** Seeded into the electron-store `pets` default on first run. Ids must stay
 *  stable ('cat'/'dog'/'pokemon') since existing persisted MessageRule.species
 *  values reference them directly. */
export const BUILTIN_PET_PROFILES: PetProfile[] = [
  {
    id: 'cat',
    label: 'Cat',
    poses: ['Cat1.png', 'Cat2.png', 'Cat3.png', 'Cat4.png']
  },
  {
    id: 'dog',
    label: 'Dog',
    poses: ['Dog1.png', 'Dog2.png', 'Dog3.png', 'Dog4.png']
  },
  {
    id: 'pokemon',
    label: 'Pokemon',
    poses: ['Pokemon1.png', 'Pokemon2.png', 'Pokemon3.png', 'Pokemon4.png']
  }
]

export function randomPoseIndex(poses: string[]): number | null {
  if (poses.length === 0) return null
  return Math.floor(Math.random() * poses.length)
}

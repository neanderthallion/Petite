/// <reference types="vite/client" />

import type { PetiteApi } from '../preload/index'

declare global {
  interface Window {
    petite: PetiteApi
  }
}

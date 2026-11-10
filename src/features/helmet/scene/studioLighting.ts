export const LIGHTING_PRESETS = {
  studio: {
    label: 'Studio',
    description: 'Balanced neutral light.',
    key: 2.6,
    keyColor: '#fff5e7',
    rim: 1.8,
    rimColor: '#b5c6de',
    fill: 1,
    ambient: 0.65,
  },
  contrast: {
    label: 'Contrast',
    description: 'A stronger key with restrained fill.',
    key: 3.4,
    keyColor: '#fff5e7',
    rim: 2.1,
    rimColor: '#b5c6de',
    fill: 0.3,
    ambient: 0.2,
  },
  warm: {
    label: 'Warm',
    description: 'A warmer key and softer tonal balance.',
    key: 2.8,
    keyColor: '#ffd1a0',
    rim: 1.2,
    rimColor: '#e0c2a6',
    fill: 0.8,
    ambient: 0.55,
  },
} as const

export type LightingPreset = keyof typeof LIGHTING_PRESETS
export type LightingConfiguration = {
  preset: LightingPreset
  intensity: number
}
export const DEFAULT_LIGHTING: LightingConfiguration = {
  preset: 'studio',
  intensity: 1,
}

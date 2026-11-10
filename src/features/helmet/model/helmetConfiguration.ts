export type HelmetConfiguration = {
  shell: 'original' | 'ivory' | 'graphite' | 'signal'
  finish: 'gloss' | 'satin'
  visor: 'smoke' | 'silver' | 'copper'
}

export const FACTORY_CONFIGURATION: HelmetConfiguration = { shell: 'original', finish: 'gloss', visor: 'smoke' }

export const MATERIAL_PRESETS: { id: string; name: string; description: string; configuration: HelmetConfiguration }[] = [
  { id: 'factory', name: 'Factory', description: 'Original Zhou livery · gloss', configuration: FACTORY_CONFIGURATION },
  { id: 'stealth', name: 'Stealth', description: 'Graphite graphic · satin', configuration: { shell: 'graphite', finish: 'satin', visor: 'smoke' } },
  { id: 'apex', name: 'Apex', description: 'Signal graphic · gloss', configuration: { shell: 'signal', finish: 'gloss', visor: 'copper' } },
]

export const SHELL_COLORS = { original: '#ffffff', ivory: '#f1f0eb', graphite: '#444951', signal: '#ff6547' }
export const VISOR_COLORS = { smoke: '#8a96a3', silver: '#f1f0eb', copper: '#dca27a' }

export const HELMET_HOTSPOTS = [
  { id: 'shell', label: 'Outer shell', position: [0.45, 1.62, -0.18], view: 'threeQuarter', description: 'The main painted surface carries the original Zhou Guanyu livery. Design mode changes its tone and finish while retaining the graphic pattern and normal map.' },
  { id: 'visor', label: 'Visor', position: [0, 1.13, -0.94], view: 'front', description: 'A reflective tinted surface with the source graphics intact. Its mesh also includes fixed vent inserts and trim, so opening it requires separating those parts first.' },
  { id: 'intake', label: 'Front intake', position: [0, 0.89, -0.96], view: 'front', description: 'The visible chin opening and surrounding trim are part of the source model. This study demonstrates their shape; it makes no airflow or safety-performance claims.' },
] as const

export type HotspotId = typeof HELMET_HOTSPOTS[number]['id']

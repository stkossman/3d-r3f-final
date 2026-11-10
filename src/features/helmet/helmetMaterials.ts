import { FrontSide, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

export const HELMET_PARTS = {
  shell: 'Helmet_main_Helmet_main_0',
  components: 'Helmet_Component_Helmet_Component_0',
  interior: 'Helmet_inside_Helmet_inside_0',
  visor: 'Helmet_glass_Helmet_glass_0',
} as const

export function createHelmetMaterial(source: MeshStandardMaterial, meshName: string) {
  const material = source.clone()
  material.envMapIntensity = 0.85
  if (meshName === HELMET_PARTS.shell) {
    material.side = FrontSide
    material.metalness = 0.08
  }
  if (meshName === HELMET_PARTS.interior) {
    material.roughness = 0.95
    material.metalness = 0
    material.envMapIntensity = 0.2
  }
  if (meshName === HELMET_PARTS.visor) {
    // Reflective smoke keeps the original alpha/graphics without a transmission pass.
    material.roughness = 0.19
    material.metalness = 0.65
    material.envMapIntensity = 1.25
    material.depthWrite = false
    if (material instanceof MeshPhysicalMaterial) {
      material.clearcoat = 1
      material.clearcoatRoughness = 0.08
    }
  }
  return material
}

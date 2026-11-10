import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { MeshoptDecoder } from 'meshoptimizer'
import sharp from 'sharp'

sharp.concurrency(1)
sharp.cache(false)

// Work from the shipped derivative; never rewrite the source or runtime GLB.
const document = await new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
  .read('public/models/helmet.glb')
const nodes = document.getRoot().listNodes()
const components = nodes.find((node) => node.getMesh()?.getName() === 'Helmet_Component_Helmet_Component_0')
const visor = document.getRoot().listMaterials().find((material) => material.getName() === 'Helmet_glass')
if (!components || !visor?.getBaseColorTexture()) throw new Error('Missing customization surfaces.')

const primitive = components.getMesh().listPrimitives()[0]
const positions = primitive.getAttribute('POSITION')
const uvs = primitive.getAttribute('TEXCOORD_0')
const indices = primitive.getIndices()
const matrix = components.getWorldMatrix()
const size = 2048
const polygons = []
for (let index = 0; index < indices.getCount(); index += 3) {
  const vertices = [0, 1, 2].map((offset) => indices.getScalar(index + offset))
  // Inspection confirms the entire rear spoiler lies above Y=0 and behind Z=0.5
  // in exporter world space. Straps, fasteners and front fittings are outside it.
  const rear = vertices.every((vertex) => {
    const [x, y, z] = positions.getElement(vertex, [])
    const worldY = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]
    const worldZ = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
    return worldY > 0 && worldZ > 0.5
  })
  if (!rear) continue
  // glTF UVs and embedded image rows both start at the top.
  const points = vertices.map((vertex) => uvs.getElement(vertex, []).map((value) => value * size).join(',')).join(' ')
  polygons.push(`<polygon points="${points}"/>`)
}
if (!polygons.length) throw new Error('Rear spoiler mask is empty.')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="black"/><g fill="white" stroke="white" stroke-width="2">${polygons.join('')}</g></svg>`
// A small gutter keeps bilinear filtering from exposing original paint at seams.
const mask = await sharp(Buffer.from(svg)).greyscale().removeAlpha().toBuffer()
const componentImage = primitive.getMaterial().getBaseColorTexture().getImage()
const componentNeutral = await sharp(componentImage).greyscale().normalise().png().toBuffer()
const componentTone = await sharp(componentNeutral).removeAlpha().linear(0.35, 160)
  .toColourspace('srgb').png().toBuffer()
await sharp(componentTone).joinChannel(mask).webp({ lossless: true }).toFile('public/models/rear-shell-tone.webp')

const visorImage = visor.getBaseColorTexture().getImage()
const neutral = await sharp(visorImage).greyscale().normalise().png().toBuffer()
// Lift baked dark glass into a tintable range, retaining graphics and source alpha.
await sharp(neutral).linear(0.35, 160).webp({ quality: 92 }).toFile('public/models/visor-tone.webp')
console.log(`Prepared rear mask (${polygons.length} triangles) and neutral visor map.`)

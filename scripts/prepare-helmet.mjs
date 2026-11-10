import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions'
import { meshopt } from '@gltf-transform/functions'
import { MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'

sharp.concurrency(1)
sharp.cache(false)

const source = 'assets/candidates/f1-zhou/f1_helmet_zhouguanyu_24.glb'
const output = process.argv[2] ?? 'public/models/helmet.glb'
const textureSize = Number(process.argv[3] ?? 2048)
if (resolve(output) === resolve(source)) throw new Error('The source model must remain unchanged.')
if (![1024, 2048].includes(textureSize)) throw new Error('Use a 1024 or 2048 texture limit.')

await MeshoptEncoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
const original = await readFile(source)
const document = await io.read(source)
const meshNames = document.getRoot().listMeshes().map((mesh) => mesh.getName())
const shellImage = document.getRoot().listMaterials().find((material) => material.getName() === 'Helmet_main')?.getBaseColorTexture()?.getImage()?.slice()
if (!shellImage) throw new Error('Missing shell base-color image.')
const colorTextures = new Set(document.getRoot().listMaterials().map((material) => material.getBaseColorTexture()))
for (const texture of document.getRoot().listTextures()) {
  const encoded = await sharp(texture.getImage()).resize(textureSize, textureSize)
    .webp(colorTextures.has(texture) ? { quality: 92 } : { lossless: true }).toBuffer()
  // Own the bytes instead of retaining a view into a native Sharp output buffer.
  texture.setImage(Uint8Array.from(encoded)).setMimeType('image/webp')
}
document.createExtension(EXTTextureWebP).setRequired(true)

// Never flatten, join, simplify, or remove named parts needed by the viewer.
await document.transform(
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
)
if (JSON.stringify(meshNames) !== JSON.stringify(document.getRoot().listMeshes().map((mesh) => mesh.getName()))) {
  throw new Error('Optimization changed mesh identities.')
}
await mkdir(dirname(resolve(output)), { recursive: true })
const result = Buffer.from(await io.writeBinary(document))
const jsonLength = result.readUInt32LE(12)
const json = JSON.parse(result.subarray(20, 20 + jsonLength).toString())
const binaryOffset = 28 + jsonLength
for (const image of json.images) {
  const view = json.bufferViews[image.bufferView]
  const encoded = result.subarray(binaryOffset + view.byteOffset, binaryOffset + view.byteOffset + view.byteLength)
  const metadata = await sharp(encoded).metadata()
  if (metadata.width !== textureSize || metadata.height !== textureSize) throw new Error('Invalid output texture.')
}
await writeFile(output, result)
if (output === 'public/models/helmet.glb') {
  const monochrome = await sharp(shellImage).resize(textureSize, textureSize).greyscale().normalise().png().toBuffer()
  await sharp(monochrome).linear(0.35, 160).webp({ quality: 92 }).toFile('public/models/shell-tone.webp')
}
const report = {
  source, output, textureSize, originalBytes: original.length, optimizedBytes: result.length,
  sourceSha256: createHash('sha256').update(original).digest('hex'),
  optimizedSha256: createHash('sha256').update(result).digest('hex'),
  meshNames, nodes: json.nodes.map((node) => node.name),
  triangles: json.meshes.map((mesh) => ({ name: mesh.name, count: mesh.primitives.reduce((sum, primitive) => sum + json.accessors[primitive.indices].count / 3, 0) })),
  textures: document.getRoot().listTextures().map((texture) => ({ name: texture.getName(), size: texture.getSize(), mimeType: texture.getMimeType() })),
}
await writeFile(`${output}.json`, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))

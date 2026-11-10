# Helmet asset review

## Stages 2–4: verified runtime derivative

The review sections below record Stage 0–1 preparation. Their earlier licensing/visual uncertainties and provisional scale are superseded by this section.

On 2026-11-10 the [public Sketchfab model API](https://api.sketchfab.com/v3/models/1124fa1f754645d7b9d54de84009d463) confirmed the title, author Miopass, and CC Attribution linking CC BY 4.0. The ordinary model page still returned 403. This independently matches embedded provenance; it does not establish separate rights to third-party logos/livery. The runtime derivative carries source/author/license links and modification details in `public/models/NOTICE.txt`, linked visibly beside the viewer. No publication was performed.

| Artifact | Bytes | Decision |
| --- | --- | --- |
| Original GLB | 60,024,940 | Unchanged, ignored; SHA-256 `6b2c779831b578258b2fc2d140e97bb3ed3b678ec9aea96155fa341e3376a5c2` |
| 2K runtime GLB | 9,286,304 | Shipped; 84.53% smaller, 8.86 MiB |
| 1K comparison GLB | 3,106,988 | Generated/loaded temporarily, not shipped; smaller graphics lose fine readability |
| Tonal shell map | 60,642 | Additional 2K WebP for custom shell colors; original hues remain in Factory |

Reproduce with `bun run assets:helmet`. To prepare a temporary 1K comparison: `bun scripts/prepare-helmet.mjs <temporary-output.glb> 1024`. The source must exist locally. glTF Transform 4.5.1, Meshoptimizer 1.3.0 and Sharp 0.35.5 are development-only. The generated `helmet.glb.json` records source/output hashes, all node/mesh identities, triangle counts and texture sizes.

The script sequentially resizes all twelve 4096px PNG images to 2048px WebP: quality 92 for base color, lossless encoding after resizing for normal and metallic/roughness maps. It uses glTF Transform's medium Meshopt quantization/reordering, without joining, flattening or simplifying parts. All 13 nodes, four named meshes/materials, and 98,724 triangles are preserved. No topology reduction was necessary to meet the transfer target. Original, 2K and 1K models were loaded in the same browser scene for comparison; the retained 2K version preserves visible livery and silhouette at tested framing. Fine texture fidelity is reduced from the original 4K maps, and geometry is quantized.

Preparation initially exposed intermittent Bun/Sharp crashes and a native-buffer lifetime problem that could corrupt the first WebP. The final pipeline copies encoded bytes into owned Uint8Arrays, limits Sharp concurrency/cache and validates each embedded output image before replacing the GLB. Repeated successful 2K runs produced SHA-256 `2a090fb5d3a0c9fcb0ad74951afc8da353e1e7e55c6e7b02a1b963504df7fe42`. Source hashing remained unchanged. Do not remove output validation.

Required GLB extensions are Meshopt geometry decoding, mesh quantization and WebP; original physical-material extensions remain. Drei enables its bundled Meshopt decoder, with Draco disabled. WebP is browser decoded. Draco would add another decoder without solving the dominant texture payload. KTX2 could reduce GPU residency but needs a separate encoding/transcoder pipeline and target-device checks; it was not added. Twelve 2K RGBA images still imply about 192 MiB before mipmaps / 256 MiB with mipmaps; this is an estimate, not measured GPU memory. No 30/60fps mobile guarantee is made.

Visual evidence confirms upright Y and front negative Z with exporter ancestors retained. Runtime normalization uses precise loaded vertex bounds rather than accessor bounds: longest dimension 1.85, center X/Z and bottom Y 0.345. Approximate final bounds: X ±0.679, Y 0.345–1.734, Z ±0.925. No real physical dimensions are claimed.

Verified part mapping remains:

- `Helmet_main_Helmet_main_0`: paint and baked livery; owned physical material, original normal/roughness maps. Custom tones use a separate grayscale/tonal version of its base map; Factory restores the original.
- `Helmet_Component_Helmet_Component_0`: fixed components with original alpha/detail maps; no invented accent controls.
- `Helmet_inside_Helmet_inside_0`: rough nonmetallic interior.
- `Helmet_glass_Helmet_glass_0`: visor **plus fixed crown inserts and lower trim**. An isolated mesh browser view verified these additional pieces. Tint affects all of them and is labeled Visor & trim tint. No pivot is authored. Opening/closing is omitted because rotating this mesh would move fixed pieces; separating it is required first.

The source's broad BLEND/double-sided settings were evaluated: exterior shell is front-sided; transparent/internal parts retain source sidedness; glass keeps alpha but disables depth writes and uses reflective tint instead of expensive transmission. Original textures/geometry are shared read-only; cloned materials and the tonal texture are owned by the instance. Shell casts real shadows; glass does not cast an opaque silhouette.

All three component notes refer to visible shell, visor and chin intake shapes. Anchors use normalized display coordinates and raycast occlusion with DOM equivalents. The reference model is a visual artifact, not evidence of certification, construction material, airflow or impact performance.

## Evidence and selection

Selected: **Candidate B — F1 Helmet ZhouGuanyu 24 by Miopass**, subject to optimization and visual validation in Stage 2. Its separate named shell and visor enable customization and visor animation without first separating geometry. It also matches the motorsport brief. Candidate A is lighter to transfer but combines all geometry in one primitive/material, making those interactions substantially harder.

Inspection was read-only: parsed each local GLB v2 JSON chunk, indexed accessors, node hierarchy, material records, embedded buffer views, and PNG IHDR dimensions. No source file was converted, modified, or copied into the runtime. No visual model/render inspection was performed; texture fidelity, UV seams, transparency quality, and hinge behavior remain unverified. Only GLBs were found locally; embedded FBX node names do not prove an FBX source is available.

| Evidence | A — Motorcycle Helmet | B — F1 Helmet ZhouGuanyu 24 |
| --- | --- | --- |
| Local path | `assets/candidates/motorcycle/motorcycle_helmet.glb` | `assets/candidates/f1-zhou/f1_helmet_zhouguanyu_24.glb` |
| File size | 18,475,076 bytes (17.62 MiB) | 60,024,940 bytes (57.24 MiB) |
| Structure | 5 nodes; 1 mesh / primitive / material | 13 nodes; 4 meshes / primitives / materials |
| Geometry | 51,541 POSITION vertices; 89,740 indexed triangles | 53,163 POSITION vertices; 98,724 indexed triangles |
| Texture payload | 4 embedded PNGs, all 4096×4096 | 12 embedded PNGs, all 4096×4096 |
| Material inputs | Base color, metallic/roughness, normal, transmission | Base color, metallic/roughness, normal for each part |
| Extensions | KHR_materials_transmission | KHR_materials_clearcoat, KHR_materials_specular |
| Transparency | Combined material uses BLEND, double-sided, transmission factor 1 with texture | Component and glass use BLEND; all four materials double-sided |
| Animation / skins | No clips or skins | No clips or skins |
| Shell / visor separation | Not exposed separately | `Helmet_main` and `Helmet_glass` are distinct mesh/material groups |

### Hierarchy and interaction implications

A: `Sketchfab_model` → FBX-named transform → `RootNode` → `Plane.003_Baked` → `Plane.003_Baked_Plane.003_Baked_0`. Whole-object color changes are possible, but shell-only recoloring or a moving visor needs masks or geometry editing not available as separate parts. Blended transmission on the combined surface needs visual evaluation.

B: `Sketchfab_model` → FBX-named transform → `RootNode`, with shell, component, inside, glass, and an additional non-mesh branch. Stable mesh names and triangle counts:

- `Helmet_main_Helmet_main_0`: 25,296 triangles / 13,866 vertices.
- `Helmet_Component_Helmet_Component_0`: 14,652 triangles / 8,254 vertices.
- `Helmet_inside_Helmet_inside_0`: 2,736 triangles / 1,480 vertices.
- `Helmet_glass_Helmet_glass_0`: 56,040 triangles / 29,563 vertices.

A separate glass mesh makes visor movement feasible, but no hinge pivot or animation is authored. Validate which geometry the glass mesh contains, then establish a hinge transform from visual inspection. The visor alone holds about 57% of the triangles and is an optimization candidate. Shell material replacement is feasible; clean recoloring of the existing livery may require preserving detail maps and separating graphics from paint. Do not assume tinting a baked base-color map yields a clean solid finish.

Both exports contain axis/scale transforms, including a 0.01 scale at an ancestor. Normalize measured world bounds deliberately; physical dimensions cannot be inferred safely from names alone.

## Performance preparation

Uncompressed RGBA8 estimates for the embedded images are 256 MiB for A and 768 MiB for B, before mipmaps (roughly 341 and 1,024 MiB respectively). These are arithmetic estimates, not measured GPU allocations; actual formats and compression change usage. Texture cost is the primary concern, rather than the modest triangle-count difference.

Before shipping B: preserve the original, create a separately named runtime derivative, compare 1K/2K textures, assess supported texture compression, reduce visor topology if appearance permits, and consider geometry compression after profiling decode cost. Check normal maps, alpha sorting, double-sided surfaces, and clearcoat under neutral lighting. Measure transfer size, decode time, memory, draw calls, and mobile frame times. The four primitives suggest a low base draw count, but transparency, shadows, and render passes can multiply it. Do not promise performance from file inspection alone.

## Provenance and licensing

Embedded `asset.extras` records in both GLBs declare **CC-BY-4.0** and give these authors and source links:

- A: **XQCAD**, “Motorcycle Helmet” — [source](https://sketchfab.com/3d-models/motorcycle-helmet-dc3894945d474407bbd7a95553acdd31), [author](https://sketchfab.com/XQCAD).
- B: **Miopass**, “F1 Helmet ZhouGuanyu 24” — [source](https://sketchfab.com/3d-models/f1-helmet-zhouguanyu-24-1124fa1f754645d7b9d54de84009d463), [author](https://sketchfab.com/miopass).

The metadata points to [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Source-page requests returned 403 during this review, so current page terms and provenance were not independently confirmed. No local download license receipt was present. Before redistribution, confirm the applicable terms, retain an attribution/notice with the runtime derivative, link the source and license, and identify modifications. Model metadata does not establish permission for every third-party logo or livery; review those separately before public release.

Planned attribution: “F1 Helmet ZhouGuanyu 24” by Miopass, via Sketchfab, CC BY 4.0; append a precise modification note when a derivative exists. Keep the source, author, and license links with that credit. Stage 0 includes no model in `public/`, imports, or distribution output.

## Stage 1 read-only preparation

Re-inspected the selected local file during Stage 1: GLB v2, 60,024,940 bytes, 13 nodes, four meshes, and 12 embedded PNG images. Composed node matrices and transformed POSITION accessor bounds from the default scene. The resulting aggregate AABB is approximately X 2.108492 × Y 2.157412 × Z 2.872401; center (-0.000005, 0.197247, -0.031236); Y minimum -0.881458. These are accessor-derived conservative bounds, not rendered vertex measurements or physical dimensions. Exporter axis rotations and 0.01 scale are encoded in matrices, not node TRS fields. The separate non-mesh branch does not affect these bounds.

The visor bound occupies negative Z (approximately -1.467 to 0.181), suggesting that direction is the front; this is an inference requiring visual confirmation. Do not add an arbitrary axis correction before viewing the imported result with ancestor transforms intact.

The Stage 1 podium has radius 1.24 and top Y 0.34. A provisional Stage 2 longest-axis size of 1.7 presentation units implies uniform scale approximately 0.59184 and resulting dimensions 1.248 × 1.277 × 1.700. Center X/Z and place the measured Y minimum on the podium, using a parent group to preserve part transforms. This leaves a deliberate platform margin; final framing and scale require visual review. Presentation units are not meters and cannot drive physics without a separately justified physical calibration.

Stage 2 should load a separately prepared local GLB derivative using Drei `useGLTF` under the existing lazy Canvas/Suspense and error boundary. Inspect actual loaded bounds after normalization; preserve shell/component/inside/glass names; isolate any mutable materials. Preserve the source, compare 1K/2K and supported KTX2 texture options, then consider mesh/geometry compression after measurement. Target <=10 MB transfer as a preparation goal, not a result. No conversion, model loading, source copying, or redistribution occurred in Stage 1. Final visual quality, facing, hinge behavior, runtime compatibility, and current licensing/provenance remain unverified.

## Stage 2 entry checklist

Confirm provenance; visually inspect shell/glass separation, livery maps, and hinge placement; prepare and compare an optimized derivative; record dimensions and part mappings; add attribution with the actual runtime asset. Source models and archives remain ignored and unchanged.

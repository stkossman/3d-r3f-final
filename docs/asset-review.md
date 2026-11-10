# Helmet asset review

## Evidence and selection

Selected: **Candidate B — F1 Helmet ZhouGuanyu 24 by Miopass**, subject to optimization and visual validation in Stage 1. Its separate named shell and visor enable customization and visor animation without first separating geometry. It also matches the motorsport brief. Candidate A is lighter to transfer but combines all geometry in one primitive/material, making those interactions substantially harder.

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

## Stage 1 entry checklist

Confirm provenance; visually inspect shell/glass separation, livery maps, and hinge placement; prepare and compare an optimized derivative; record dimensions and part mappings; add attribution with the actual runtime asset. Source models and archives remain ignored and unchanged.

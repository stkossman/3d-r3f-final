# Material customization correction

The runtime GLB has four single-primitive meshes with distinct materials. The rear spoiler belongs to `Helmet_Component_Helmet_Component_0`, which also contains hardware and straps. Previously only `Helmet_main_Helmet_main_0` followed shell colors. The visor tint multiplied the original dark/colored base map, suppressing the selected color.

`rear-shell-tone.webp` supplies neutral RGB and an alpha UV mask for the rear spoiler's 3,752 triangles. The owned component material replaces only masked base-color RGB; Factory/original bypasses recoloring. Source opacity, hardware, straps, normal and metallic/roughness maps remain unchanged. The component finish retains its original PBR response.

`visor-tone.webp` neutralizes the baked base-color hues and lifts their dark values for all three visor tints. Graphic shapes, source alpha, normals, metallic/roughness maps and reflections remain. Original graphic hues are intentionally replaced by the selected tint, including Factory's smoke. Tint still covers fixed crown inserts and trim in the shared glass mesh.

Diagnostic Scan remains attached only to the main shell; its compile hook and fallback are unchanged. No geometry, transforms or GLB bytes are modified. All configuration paths use the existing owned materials, stable uniforms, texture cleanup and demand-render invalidation.

Regenerate the two new maps after preparing the runtime GLB:

```sh
bun scripts/prepare-helmet-customization.mjs
```

The script reads the shipped derivative. Inspection identified the entire rear spoiler above Y=0 and behind Z=0.5 in exporter world space; other component surfaces are outside those bounds. It rasterizes the selected triangles into component UV space with a filtering gutter. Reinspect the selection if the model changes. The source GLB remains untouched; licensing follows `public/models/NOTICE.txt`.

Verification is limited to typecheck and production build. Rendered tint appearance, transparency sorting and Diagnostic Scan acceptance require manual review.

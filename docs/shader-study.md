# Diagnostic Scan - university defense notes

The effect makes the shell's curvature readable as an illustrative surface survey. It does not measure damage, material structure, protection or certification.

The implementation extends the existing shell PBR shader through `onBeforeCompile`, rather than replacing the helmet with a flat ShaderMaterial or drawing a second helmet. Original livery, normal/roughness maps, clearcoat, customization, lighting and shadows remain. A versioned custom program cache key isolates the extension. No new textures, geometry, draw calls, render targets or postprocessing passes are added.

## GPU stages and coordinate space

`diagnostic.vert.glsl` multiplies shell-local vertices by `uScanToHelmet`. This matrix composes the actual exporter hierarchy and measured alignment transforms, stopping before the cinematic/physics presentation parents. The resulting varying is in normalized helmet coordinates: bottom near Y=0.345, top near 1.734, longest axis 1.85. The scan therefore follows the helmet when it rotates, rather than remaining fixed in world space.

`diagnostic.frag.glsl` moves a horizontal field from Y=0.25 to 1.85. Each fragment compares its interpolated height with that field. Two bounded smoothstep functions form a narrow core and restrained shoulder. A fract/step pattern adds fine graduations along X+Z, with a small time-dependent drift. The band is added to linear `outgoingLight` immediately before Three's opaque output, so the existing tone mapping and output color conversion each run once. There is no vertex displacement, so geometry bounds, raycasting and shadow depth remain valid.

| Uniform | Purpose |
| --- | --- |
| uScanToHelmet | Shell-local to normalized helmet-space matrix |
| uScanProgress | Clamped 0-1 height sweep |
| uScanTime | Elapsed active scan time, frozen when inactive |
| uScanIntensity | Bounded envelope; zero outside playback |
| uScanColor | Signal orange converted from sRGB into linear working color |

## Lifecycle and fallback

Explore's HTML Diagnostic scan button starts one 2.2-second sweep. New, actual collision counts start a 0.55-second Impact response. These are visual cues, not impact metrics. Stable ref-owned uniforms are updated in useFrame; React receives only start/end/availability changes. Playback requests demand frames only until the final zero-intensity frame. Leaving the checkpoint or hiding the tab cancels it.

Reduced motion holds a stationary band briefly, with no spatial travel or time drift. The optional shader's compile/link errors retain full diagnostics, restore the ordinary PBR callbacks/cache key and disable scan activation. This fallback changes only owned materials; cached GLB assets remain untouched.

## Verification boundary

Vite imports the separate vertex/fragment GLSL through the existing plugin; TypeScript, lint and production build cover integration, not GPU compilation. No browser automation was requested for Stage 6. Manual review must check the scan on Factory/Stealth/Apex, extreme lighting, Inspect, reduced motion, Impact reset/replay, shader-failure recovery and idle rendering. Device shader compatibility and sustained GPU cost remain unmeasured. Selective Bloom was considered but omitted because additional full-screen passes have no demonstrated benefit here.

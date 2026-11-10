# Architecture

## Modules and boundaries

| Module | Responsibility |
| --- | --- |
| App / ExperiencePreview | Semantic shell and current mode descriptions |
| ProductViewer | Local mode/configuration/annotation state, accessible controls, lazy scene, Suspense and error boundary |
| DesignControls / helmetConfiguration | Typed choices, curated presets, component descriptions and measured display-space anchors |
| SceneCanvas | Single Canvas, renderer settings and context-loss handling |
| SceneCamera | Responsive framing, OrbitControls, interruptible camera transitions and typed ref bridge |
| HelmetModel / helmetMaterials | GLB loading, normalization, owned material instances, source part mapping and occluded HTML anchors |
| ProductStage | Primitive podium, lighting, static reflection environment and shadow floor |
| useReducedMotion | Live media-query subscription |
| scripts/prepare-helmet.mjs | Offline optimization, texture validation and hash/structure report |

Relative imports, strict TypeScript and existing ESLint rules remain. No global store, backend, animation framework or testing framework is needed. The optimizer packages are development-only. Physics, custom GLSL and postprocessing remain outside this stage.

## Visual and DOM contract

Industrial Editorial / Motorsport Minimalism retains graphite, ivory, steel and sparse signal orange. Fontsource Barlow Latin 400 and Barlow Condensed Latin 600 remain locally bundled with OFL notices. The desktop hero stacks below 681px.

Ordinary DOM styling uses Tailwind utilities. Global CSS contains tokens and browser/base styles; no component stylesheet or inline DOM style object was added. Drei owns its internal HTML projection styles. Controls use buttons, fieldsets, labels, native selects, visible focus and pressed states. Impact Lab is explicitly upcoming. Component notes describe visible geometry without safety/manufacturing claims.

## Assets and ownership

Drei useGLTF loads /models/helmet.glb with Draco disabled and bundled Meshopt decoding enabled. WebP uses browser decoding; no CDN decoder or external lighting asset is requested. Each viewer clones the cached object hierarchy, shares immutable geometry/source maps, and creates four owned materials in a layout effect. Cleanup restores borrowed material references and disposes owned materials and the owned tonal texture. Cached source assets are not mutated or disposed. Strict Mode effect replay is supported.

One alignment group uses measured vertex bounds: longest axis 1.85 presentation units, centered X/Z, bottom Y 0.345 above the podium top at 0.34. Exporter ancestors and part transforms remain intact; front is negative Z, confirmed visually. Approximate normalized bounds: X ±0.679, Y 0.345–1.734, Z ±0.925. These units are not calibrated meters. Hotspots use this normalized display space.

Four actual mesh names map shell, components, interior and glass. Shell paint uses a physical material, original normal/detail maps, low metalness and clearcoat; its exterior uses front faces. Interior stays rough and nonmetallic. Components retain source alpha. Glass uses reflective smoke, source alpha/graphics and no transmission pass; depth writes are off. Internal/transparent parts retain source double-sidedness.

The glass mesh also contains fixed crown inserts and chin trim, as confirmed by an isolated browser view. No hinge is authored. Rotating the entire mesh would detach those pieces, so visor opening is omitted pending geometry separation/remodeling. Tint intentionally covers visor and trim and is labeled accordingly.

## Configuration

ProductViewer owns a typed local configuration passed explicitly into the scene. Factory preserves the original Zhou livery. Stealth uses graphite/satin/smoke; Apex uses signal/gloss/copper. Custom options also include ivory and silver.

A separate 2K monochrome/tonal shell map preserves graphic shapes while allowing recoloring; custom variants intentionally change the original hues/contrast. Normal maps remain. Satin uses scalar roughness instead of the baked roughness map; gloss restores that source map. Factory restores original colors and baseline parameters.

Selections mutate only owned material parameters and invalidate rendering, without reloading the GLB or allocating geometry/materials per selection. Mode switches preserve configuration and keep the Canvas mounted. Reset view resets the camera; Restore factory resets materials.

## Camera and motion

Perspective: 35° FOV, near/far 0.1/40, target (0, 0.8, 0), home direction proportional to (4, 2.4, -5). Framing fits a radius-1.55 display sphere into the tighter viewport axis. Minimum distance fits the sphere; maximum is 1.65× minimum; home is 1.12× minimum. Resize preserves orbit direction and relative zoom and cancels active transitions. Polar limits are 22.5°–80°. Azimuth is free; pan/auto-rotation are off.

Front/side/rear/three-quarter directions are explicit data. Spherical interpolation follows the shortest azimuth over 0.65 seconds with cubic ease-out. Refs and preallocated vectors own frame values; no per-frame React state. Damping is flushed/disabled while programmatic movement owns the camera. Orbit start events and DOM rotate/zoom cancel movement and return ownership to the user. Rapid requests begin at the current position; reduced motion applies destinations immediately. Reset has a fixed home distance/direction.

Demand rendering remains. Drei invalidates for controls/damping; resize, configuration and camera requests invalidate explicitly. Active transitions request frames until complete. No decorative infinite loop. HTML hotspots use raycast occlusion and low z-index; equivalent DOM component buttons remain available even when a marker is occluded. Narrow screens show only the chosen marker (shell initially) to prevent overlap.

Fine pointers drag/scroll. Coarse pointers start with the canvas excluded from hit testing. Enable touch controls opts into drag/pinch; Return to page scrolling releases it. Controls remain outside the gesture surface.

## Lighting and renderer

Three procedural Lightformers are captured once into a 256px environment. They create studio reflections without an HDRI download or continuous capture. A warm key, cool rim, front fill and restrained hemisphere separate surfaces. Only the key casts shadows: 2048² PCF map, ±3 bounds, near/far 0.5/15, bias -0.0002 and normal bias 0.015. Glass does not cast an opaque shadow; shell/podium cast onto the platform/floor. The darker podium top supports the product.

WebGL renderer: antialiasing, opaque background, sRGB output, ACES filmic mapping, exposure 1.1, DPR 1–1.5. Fog joins floor and studio background. No bloom, custom shaders, transmission pass or postprocessing.

## Compatibility and verification

Installed versions checked at entry: React/DOM 19.3.1, Three/types 0.187.0, Fiber 9.8.2, Drei 10.7.9, Vite 7.3.8. Core peer ranges remain compatible. No existing packages were upgraded. Preparation adds glTF Transform 4.5.1, Meshoptimizer 1.3.0 and Sharp 0.35.5 as development tools. Bun 1.3.5 was used.

Each stage passed typecheck, lint, build and whitespace checks. Browser plugin unavailable: connected Playwright/Chromium was used without installing a framework. Source/2K/1K views were compared. Checks exercised all 24 material combinations, presets, mode persistence, factory reset, camera views/reset, pointer interruption, reduced motion, notes, delayed loading, blocked-model failure and context loss. Failed scenes disable camera/material controls. Overflow was checked at 320/375/768/844/1440/1920px. Touch emulation checked scrolling opt-in, rotation, pinch zoom and preset selection with no page errors; it is not a physical-device performance test.

A settled desktop sample reported 24 render calls and 217,550 triangles including shadow/transparency passes, 19 geometries and 20 texture objects. A 500ms idle sample rendered zero additional frames. Texture counts are not GPU memory measurements. Twelve 2K RGBA textures imply about 192 MiB before mipmaps (256 MiB with mipmaps), plus tonal/environment/renderer allocations. WebP reduces transfer, not GPU residency; KTX2 or lower-resolution device variants remain profiling options.

Known warnings: upstream Fiber constructs deprecated THREE.Clock; Vite advises about the lazy scene chunk exceeding 500kB. Neither is suppressed. The DOM shell renders before the lazy scene. Sustained frame time, thermal behavior, real mobile GPU memory and other browser engines remain unverified; no universal 30/60fps claim is made.

Stage 5 must establish physical units, colliders, fixed steps, bounded catch-up and a single physics owner for rigid-body transforms. Presentation geometry/units are not an impact simulation or safety certification.

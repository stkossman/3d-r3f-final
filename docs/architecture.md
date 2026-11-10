# Architecture

## Current structure

| Location | Responsibility |
| --- | --- |
| `src/main.tsx` | React root, Strict Mode, Fontsource weight imports, global CSS |
| `src/App.tsx` | Semantic DOM shell, hero, section composition, footer |
| `src/features/helmet/ProductViewer.tsx` | Accessible DOM metadata and controls, lazy boundary, Suspense and renderer error fallback |
| `src/features/helmet/SceneCanvas.tsx` | Single Canvas owner, renderer settings, lifecycle and context-loss handling |
| `src/features/helmet/SceneCamera.tsx` | Perspective framing, bounded Drei OrbitControls, imperative DOM control bridge |
| `src/features/helmet/ProductStage.tsx` | Primitive composition and studio lighting |
| `src/components/ExperiencePreview.tsx` | Static descriptions of upcoming modes |
| `src/index.css` | Tailwind v4 import, reusable theme tokens, fonts, browser defaults |
| `public/` | Favicon and font license notices; font binaries are bundled from Fontsource |
| `assets/candidates/` | Ignored, unchanged local source models; never runtime URLs |
| `docs/` | Architecture, asset evidence, and staged delivery criteria |

Relative imports are sufficient at this size. No aliases, generic services, unused shared types, global store, or empty feature directories are introduced. Existing ESLint rules and strict TypeScript remain enabled. Vite activates the existing React, Tailwind, and GLSL plugins; TypeScript recognizes shader extensions. GLSL pipeline configuration is present, but no shader is implemented.

## Visual contract

Industrial Editorial / Motorsport Minimalism. Graphite `#111318` background, ivory `#F1F0EB` primary text, steel `#8C939E` secondary text, and signal orange `#FF6547` for limited emphasis. Surface `#181B21` and separator `#34373E` support the reserved viewer without decoration.

Barlow Condensed 600 supplies the uppercase headline; Barlow 400 supplies readable body text and metadata. Import only the Latin 400 and 600 styles from `@fontsource/barlow` and `@fontsource/barlow-condensed` respectively. Vite bundles their font files locally; OFL notices are retained in `public/fonts/`, and there are no runtime font-provider requests. Use the declared weights rather than inventing extra weights. Fluid page gutters and headline sizing sit over a two-column desktop hero; at 680px it becomes one column. Mode previews stack at the same breakpoint. There are no entrance animations; smooth anchor scrolling is enabled only when reduced motion is not requested.

Navigation consists of genuine in-page links. Upcoming modes are list content, never inactive-looking buttons. Viewer metadata describes the primitive study and explicitly says the helmet arrives in Stage 2. Maintain keyboard focus visibility, semantic headings, and readable contrast.

Tailwind CSS is the first choice for all DOM layout, spacing, size, typography, color, borders, breakpoints, states, and ordinary transitions. The existing shell has been migrated from App.css to utilities without changing its editorial direction. Global resets live in `@layer base` so utilities can override them. Global CSS is limited to tokens, font/base definitions, reusable keyframes, complex animations, third-party requirements, and exceptional styles that utilities cannot express cleanly. No component CSS/modules or ordinary inline DOM style objects.

## Stage 1 scene and UI boundary

`src/features/helmet/` owns a single lazy-loaded R3F Canvas. Product copy, navigation, buttons, loading/error messages, and fallback remain DOM React. Scene descendants own lights, meshes, camera helpers, and R3F hooks. Suspense covers the scene chunk; a DOM error boundary catches initialization/render failures. Canvas fallback covers unavailable WebGL, and a cleaned-up context-loss listener replaces a lost renderer with the same accessible fallback. Controls remain disabled until the scene mounts and disable again when it unmounts. Reload is the recovery path; no async model assets exist yet.

Three stacked 96-segment cylinders form the support, recessed spacer, and steel top. Two torus meshes add technical rings; boxes form four index marks and a front accent. A single-sided plane receives real cast shadows. Top radius is 1.24 and height is 0.34, in presentation units. The center deliberately stays empty. Geometry/material lifetime is owned by R3F, with no external cached model mutations.

The perspective camera uses 35° vertical FOV, near/far 0.1/40, a target at (0, 0.25, 0), and a home direction proportional to (4, 3, 5). Framing fits a radius-1.7 sphere against the tighter horizontal/vertical FOV. Resize preserves orbit direction and relative zoom; home and distance limits are recomputed for the aspect ratio. Minimum distance fits the full display, maximum is 1.65× minimum, and home is 1.12× minimum. Polar angle is restricted to 22.5°–72°, keeping the camera above the floor; azimuth is free around the circular display. Panning and automatic rotation are disabled. Drei manages damping and demand invalidation. Reset flushes residual damping before restoring the saved home view.

DOM buttons provide left/right orbit, zoom, and reset without requiring a pointer gesture. Fine pointers drag/scroll over the scene. Coarse pointers start with the canvas excluded from hit testing; Enable touch controls opts into drag/pinch and Return to page scrolling releases it. Controls stay outside the gesture surface. No optional or autonomous animation is present; reset is immediate.

Lighting uses a hemisphere plus a warm directional key, cool rim, and low-intensity front fill. Only the key casts shadows: 1024² PCF map, ±3 orthographic bounds, near/far 0.5/15, small bias and normal bias. Three r187 removed PCFSoftShadowMap; use PCFShadowMap. Standard materials use controlled roughness/metalness, without HDRI, emission, bloom, or postprocessing. Renderer settings: antialiasing, opaque background, sRGB output, ACES filmic mapping, exposure 1.1, DPR 1–1.5. Fog merges the floor into the graphite surface.

Start with the installed WebGL renderer, physical materials, controlled lighting, explicit shadow ownership, and a capped device pixel ratio. Establish framing and scale using measured model bounds rather than inherited exporter transforms. Target 60 fps desktop and at least 30 fps on a representative mobile device, then measure before adding expensive effects. Start asset planning at <=10 MB transfer and 1K–2K texture variants; these are preparation targets, not measured results.

Demand rendering is enabled: Drei invalidates on control changes and continues while damping settles; framing and DOM camera actions explicitly invalidate. Browser inspection confirmed zero new rendered frames across a 400 ms idle sample. No per-frame allocations or React state updates are introduced. Camera actions cross the DOM/scene boundary through a typed ref; local state only tracks readiness and touch activation. Future loading caches share resources: isolate mutable material instances and define disposal ownership. Map controls to verified mesh/material names, not mesh array indexes.

Keep local interaction state in the feature. Introduce Zustand only when DOM controls and scene consumers actually share configuration or mode state; use focused selectors. Do not store frame-by-frame transforms there.

Impact Lab will use Rapier, a fixed simulation timestep, bounded catch-up, normalized units, explicit transform ownership, and primitive/compound or suitable convex colliders. The visual mesh is not the default dynamic collider. Collision output is an illustrative simulation, not a safety certification or medical measurement.

Add GLSL effects in a dedicated feature only when requested, with documented coordinate spaces, stable uniforms, an ordinary material fallback, and revision-aware material integration. Postprocessing comes after useful baseline lighting, correct color output, and measured device budgets.

## Installed compatibility audit

Read from actual `node_modules/*/package.json` during Stage 0; declarations are ranges in `package.json`, exact resolutions are in `bun.lock`.

| Package | Installed | Relevant peer compatibility |
| --- | --- | --- |
| React / React DOM | 19.3.1 / 19.3.1 | DOM requires React ^19.3.1 |
| Three.js / types | 0.187.0 / 0.187.0 | Matching revision |
| R3F | 9.8.2 | React/DOM >=19 <19.4; Three >=0.156 |
| Drei | 10.7.9 | Fiber ^9; React/DOM ^19; Three >=0.159 |
| React Three Rapier | 2.2.0 | Fiber ^9.0.4; React ^19; Three >=0.159 |
| React Three Postprocessing | 3.2.2 | Fiber >=9.7; React ^19; postprocessing ^6.36; Three >=0.156 |
| postprocessing | 6.39.6 | Three >=0.168 <0.188 |
| Vite | 7.3.8 | Node ^20.19 or >=22.12 when using Node |
| Tailwind / Vite adapter | 4.3.5 / 4.3.5 | Adapter supports Vite 5.2, 6, 7, 8 |
| vite-plugin-glsl | 1.6.2 | Vite >=3; optional esbuild >=0.25 |

These declared core peer ranges align; runtime interoperability of future scene features is not yet tested. No dependencies were upgraded or reinstalled.

## Verification boundary

Typecheck, lint, production build, and diff whitespace checks passed for Stage 1. Browser review used the already-connected Playwright tooling because the Browser plugin was unavailable; no browser dependencies or test framework were installed. Screenshots reviewed at 1440×1000 and 390×844 showed the podium and controls in frame. Additional 320px and 768px checks found no horizontal overflow. Mouse orbit, button rotation, keyboard zoom, min/max zoom limits, exact reset, emulated touch rotation/pinch, and normal page scrolling with touch controls off were exercised. Forced WebGL initialization failure and context loss showed the accessible fallback while preserving the page and disabling camera controls. Normal loading had no runtime errors or framework overlay.

The desktop scene reported 15 render calls and 5,450 triangles including its shadow pass; this is a single browser sample, not a device-performance guarantee. The lazy scene chunk is approximately 951 kB / 255 kB gzip, triggering Vite's 500 kB advisory; it does not block initial DOM rendering. R3F 9.8.2 internally constructs deprecated THREE.Clock, producing an upstream console warning with Three r187. Do not patch dependencies or suppress it. Physical-device GPU memory, sustained frame times, other browser engines, and final helmet materials remain unverified. Shader declarations/plugin initialization pass the build; custom shader compilation awaits its stage.

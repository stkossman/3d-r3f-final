# Architecture

## Current structure

| Location | Responsibility |
| --- | --- |
| `src/main.tsx` | React root, Strict Mode, Fontsource weight imports, global CSS |
| `src/App.tsx` | Semantic DOM shell, hero, section composition, footer |
| `src/components/ViewerReservation.tsx` | Explicit empty state for the future viewer; no canvas |
| `src/components/ExperiencePreview.tsx` | Static descriptions of upcoming modes |
| `src/index.css` | Tailwind v4 import, reusable theme tokens, fonts, browser defaults |
| `src/App.css` | Shell layout, responsive composition, component styles |
| `public/` | Favicon and font license notices; font binaries are bundled from Fontsource |
| `assets/candidates/` | Ignored, unchanged local source models; never runtime URLs |
| `docs/` | Architecture, asset evidence, and staged delivery criteria |

Relative imports are sufficient at this size. No aliases, generic services, unused shared types, global store, or empty feature directories are introduced. Existing ESLint rules and strict TypeScript remain enabled. Vite activates the existing React, Tailwind, and GLSL plugins; TypeScript recognizes shader extensions. GLSL pipeline configuration is present, but no shader is implemented.

## Visual contract

Industrial Editorial / Motorsport Minimalism. Graphite `#111318` background, ivory `#F1F0EB` primary text, steel `#8C939E` secondary text, and signal orange `#FF6547` for limited emphasis. Surface `#181B21` and separator `#34373E` support the reserved viewer without decoration.

Barlow Condensed 600 supplies the uppercase headline; Barlow 400 supplies readable body text and metadata. Import only the Latin 400 and 600 styles from `@fontsource/barlow` and `@fontsource/barlow-condensed` respectively. Vite bundles their font files locally; OFL notices are retained in `public/fonts/`, and there are no runtime font-provider requests. Use the declared weights rather than inventing extra weights. Fluid page gutters and headline sizing sit over a two-column desktop hero; at 680px it becomes one column. Mode previews stack at the same breakpoint. There are no entrance animations; smooth anchor scrolling is enabled only when reduced motion is not requested.

Navigation consists of genuine in-page links. Upcoming modes are list content, never inactive-looking buttons. Keep the explicit viewer caption until a real scene replaces it. Maintain keyboard focus visibility, semantic headings, and readable contrast.

## Planned UI / scene boundary

Introduce `src/features/helmet/` only when Stage 1 adds the scene. Keep a single R3F Canvas owner inside that feature. Product copy, navigation, accessible controls, loading/error messages, and the fallback stay in DOM React. Scene descendants own lights, meshes, camera helpers, and R3F hooks. Lazy-load the 3D boundary so a failed renderer does not remove the page. Add Suspense for loading and a separate error boundary for load/render failures; provide a useful WebGL-unavailable state.

Start with the installed WebGL renderer, physical materials, controlled lighting, explicit shadow ownership, and a capped device pixel ratio. Establish framing and scale using measured model bounds rather than inherited exporter transforms. Target 60 fps desktop and at least 30 fps on a representative mobile device, then measure before adding expensive effects. Start asset planning at <=10 MB transfer and 1K–2K texture variants; these are preparation targets, not measured results.

Use demand rendering only after verifying controls and animation invalidation. Let R3F own the render loop. Use refs and frame delta for continuous motion, never per-frame React state. Loading caches share resources: isolate mutable material instances and define disposal ownership. Map controls to verified mesh/material names, not mesh array indexes.

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

## Stage 0 verification boundary

Run typecheck, lint, and production build. Browser automation is intentionally excluded by the Stage 0 brief. Responsive rules and semantic accessibility are implemented, but visual rendering, keyboard traversal, and device behavior still need manual browser review. Shader declarations and plugin initialization are checked by TypeScript/build; actual shader compilation awaits the shader stage.

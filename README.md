# APEX / 01

**Interactive Motorsport Helmet Experience** · Engineered for the edge.

A university final project featuring a real F1 helmet in a continuous, native-scroll product narrative. Stages 0-6 are implemented; Stage 6 awaits manual visual acceptance.

## Run locally

Use Bun exclusively (verified with 1.3.5). Vite 7 requires Node 20.19+ or 22.12+ when invoked through Node.

```sh
bun install --frozen-lockfile
bun run dev
bun run typecheck
bun run lint
bun run build
bun run preview
bun scripts/verify-impact.ts
```

Preview serves the local production build; it does not deploy. Preserve bun.lock.

## Experience

- **Introduction:** a five-checkpoint narrative begins with a three-quarter reveal. Native anchors support navigation, history and refresh.
- **Explore:** three keyboard-accessible numbered markers open component notes inside the viewer. Notes follow projected anchors, clamp to the viewport, and close with the marker, close button or Escape. Dashed markers indicate occluded anchors while remaining accessible. Diagnostic scan runs a custom GLSL sweep across the shell while preserving its PBR finish.
- **Design:** existing Factory/Stealth/Apex presets, shell tones, finishes and visor-and-trim tints modify owned PBR materials. Restore factory recovers the original livery.
- **Lighting:** Studio/Contrast/Warm presets, a 0.65–1.35× key-light control and Reset lighting change actual lights. Material and lighting choices persist across checkpoints.
- **Impact Lab:** real Rapier drops with height/bounce controls, pause/resume, reset/replay and contact telemetry. Assumed 0.34 m length / 1.5 kg mass and simplified colliders make this an illustrative experiment, not a helmet safety test. Scroll exit resets physics; tab hiding pauses it. Actual contacts also trigger a brief diagnostic shader pulse. No postprocessing is used.

Cinematic mode leaves wheel and touch input to the document. Explicit **Inspect** enables orbit, bounded zoom, camera presets and reset; **Return to cinematic** blends back to the current scroll composition. One Canvas/model remains mounted. Mobile uses centered framing and controls below the scene; opening a note makes room for its card. Reduced motion removes cinematic rotation and uses immediate composition changes. Loading, model errors and WebGL/context-loss fallbacks preserve the page and disable unavailable controls.

The source glass mesh also contains fixed crown inserts and lower trim. Opening it would move those parts incorrectly; articulation is unavailable until geometry separation. No safety/manufacturing specifications are inferred from the model.

Initial loads show an APEX wordmark preloader. Resource counts come from the actual loading manager; release waits for decoding, Rapier, shader preparation and a rendered frame. Errors or a 45-second initialization timeout release the semantic fallback. Anchor navigation does not replay it. Reduced motion removes the traveling scan and animated reveal.

## Assets and credits

The included runtime GLB is **9,286,304 bytes**, reduced from **60,024,940 bytes** using Meshopt and 2K WebP. Four named meshes, all 98,724 triangles, source graphics and detail maps are retained. Custom tones use an additional 60,642-byte tonal shell texture. Factory preserves original colors. Browser loading uses bundled Meshopt decoding and native WebP.

Regenerate from the ignored local source:

```sh
bun run assets:helmet
```

The script requires assets/candidates/f1-zhou/f1_helmet_zhouguanyu_24.glb, preserves it, validates output textures and writes a hash/structure report. A clean clone includes the runtime derivative, not the original. Preparation tools are development dependencies.

“F1 Helmet ZhouGuanyu 24” by [Miopass](https://sketchfab.com/miopass), via [Sketchfab](https://sketchfab.com/3d-models/f1-helmet-zhouguanyu-24-1124fa1f754645d7b9d54de84009d463), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [the asset notice](public/models/NOTICE.txt) for modifications. Model licensing does not grant separate trademark rights or imply endorsement. Fontsource Barlow/Barlow Condensed OFL notices remain in public/fonts/.

## Engineering and verification

React 19, strict TypeScript, Vite 7, Tailwind CSS 4, Three r187, Fiber 9 and Drei 10. One lazy demand-rendered Canvas, explicit ownership, local configuration state, Motion scroll values and Tailwind-first DOM styling preserve the Industrial Editorial identity. No new browser runtime dependencies were needed.

Stage 4.5 A/B/C passed typecheck, lint, build and whitespace gates. Isolated Chromium checks covered annotations, reverse scroll interpolation, Inspect ownership/return, anchors/refresh, configuration/lighting persistence, keyboard operation, reduced motion and loading/error/context-loss paths. All requested widths (320/375/768/1024/1440/1920px) were checked for overflow and captured. A settled 700ms sample added zero WebGL frames; the same helmet/material/Canvas survived navigation with one GLB request. Physical-device frame rate/GPU memory and other browser engines remain unverified. Known advisories: a large lazy scene chunk and upstream THREE.Clock deprecation. No deployment has been performed.

The helmet feature has a single `ProductViewer.tsx` entry point, with shallow `animation`, `camera`, `controls`, `loading`, `model`, `physics`, `scene` and `shaders` folders. See the architecture document for module ownership.

- [Architecture and verification limits](docs/architecture.md)
- [Asset evidence, optimization and licensing](docs/asset-review.md)
- [Custom shader explanation for the defense](docs/shader-study.md)
- [Stages and completion criteria](docs/roadmap.md)
- [Contributor instructions](AGENTS.md)

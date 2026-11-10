# APEX / 01

**Interactive Motorsport Helmet Experience** · Engineered for the edge.

A university final project featuring a real F1 helmet, studio materials and two functional modes: Explore and Design. Stages 0–4 are implemented; Impact Lab begins in Stage 5.

## Run locally

Use Bun exclusively (verified with 1.3.5). Vite 7 requires Node 20.19+ or 22.12+ when invoked through Node.

```sh
bun install --frozen-lockfile
bun run dev
bun run typecheck
bun run lint
bun run build
bun run preview
```

Preview serves the local production build; it does not deploy. Preserve bun.lock.

## Experience

- **Explore:** rotate, bounded zoom, accessible camera buttons, smooth front/side/rear/three-quarter views, reset and three anchored component notes with DOM equivalents.
- **Design:** Factory/Stealth/Apex presets; original/ivory/graphite/signal shell tones; gloss/satin finish; smoke/silver/copper visor-and-trim tints. Actual instance-owned PBR materials change, choices persist between modes, and Restore factory recovers the original livery.
- **Impact Lab:** explicitly upcoming. No physics, custom shaders or postprocessing are implemented.

Touch inspection is opt-in to preserve page scrolling. Camera motion respects reduced motion, cancels on input and stops rendering when settled. Loading, model errors and WebGL/context-loss fallbacks preserve the page and disable unavailable scene controls.

The source glass mesh also contains fixed crown inserts and lower trim. Opening it would move those parts incorrectly; articulation is unavailable until geometry separation. No safety/manufacturing specifications are inferred from the model.

## Assets and credits

The included runtime GLB is **9,286,304 bytes**, reduced from **60,024,940 bytes** using Meshopt and 2K WebP. Four named meshes, all 98,724 triangles, source graphics and detail maps are retained. Custom tones use an additional 60,642-byte tonal shell texture. Factory preserves original colors. Browser loading uses bundled Meshopt decoding and native WebP.

Regenerate from the ignored local source:

```sh
bun run assets:helmet
```

The script requires assets/candidates/f1-zhou/f1_helmet_zhouguanyu_24.glb, preserves it, validates output textures and writes a hash/structure report. A clean clone includes the runtime derivative, not the original. Preparation tools are development dependencies.

“F1 Helmet ZhouGuanyu 24” by [Miopass](https://sketchfab.com/miopass), via [Sketchfab](https://sketchfab.com/3d-models/f1-helmet-zhouguanyu-24-1124fa1f754645d7b9d54de84009d463), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [the asset notice](public/models/NOTICE.txt) for modifications. Model licensing does not grant separate trademark rights or imply endorsement. Fontsource Barlow/Barlow Condensed OFL notices remain in public/fonts/.

## Engineering and verification

React 19, strict TypeScript, Vite 7, Tailwind CSS 4, Three r187, Fiber 9 and Drei 10. One lazy demand-rendered Canvas, explicit ownership, local configuration state and Tailwind-first DOM styling preserve the Industrial Editorial identity. No new browser runtime dependencies were needed.

Per-stage gates and Chromium checks passed; responsive widths from 320–1920px, material choices, camera actions, notes, reduced motion and failures were exercised. Physical-device frame rate/GPU memory and other browser engines remain unverified. Known advisories: a large lazy scene chunk and upstream THREE.Clock deprecation. No deployment has been performed.

- [Architecture and verification limits](docs/architecture.md)
- [Asset evidence, optimization and licensing](docs/asset-review.md)
- [Stages and completion criteria](docs/roadmap.md)
- [Contributor instructions](AGENTS.md)

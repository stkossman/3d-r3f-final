# APEX / 01

**Interactive Motorsport Helmet Experience** · Engineered for the edge.

A university final project exploring a racing helmet through three planned modes: Explore, Design, and Impact Lab. Stage 1 adds an interactive primitive product display; the helmet itself arrives in Stage 2.

## Run locally

Prerequisites: Bun (verified with 1.3.5). Vite 7 requires Node 20.19+ or 22.12+ when running through Node; use Node 22.12+ if installed alongside Bun.

```sh
bun install --frozen-lockfile
bun run dev
bun run typecheck
bun run lint
bun run build
bun run preview
```

Open the local URL printed by Vite. `preview` serves the production output after a build; it is not a deployment command. Bun is the only package manager; preserve `bun.lock`.

## Stack and current status

React 19, TypeScript 5.9 in strict mode, Vite 7, Tailwind CSS 4, and GLSL imports through `vite-plugin-glsl`. Three.js, React Three Fiber, and Drei power the lazy-loaded scene. Rapier, postprocessing, Zustand, and Motion remain unused. Lucide supplies UI icons.

Implemented: responsive Tailwind-first DOM shell, semantic navigation, keyboard skip link and focus styles, graphite/ivory tokens, restrained signal orange, self-hosted Barlow typography, a layered primitive podium with lighting and shadows, bounded orbit/zoom/reset controls, loading/error/WebGL fallback, and explicitly upcoming mode previews. Touch interaction is opt-in to preserve page scrolling. No model, configurator, physics, custom shaders, or postprocessing yet. No deployment has been performed.

Source helmet candidates remain local in ignored `assets/candidates/`; a clean clone does not include them. The selected F1 model requires runtime preparation before integration. Fonts are bundled from `@fontsource/barlow` and `@fontsource/barlow-condensed`; their OFL notices are retained in `public/fonts/`.

## Development guide

- [Architecture and compatibility](docs/architecture.md)
- [Helmet comparison, selection, and asset preparation](docs/asset-review.md)
- [Stages 0–7 and completion criteria](docs/roadmap.md)
- [Contributor and agent instructions](AGENTS.md)

Next: Stage 2 prepares and integrates the optimized helmet and adds model-specific exploration. Source bounds and preparation requirements are recorded in the asset review. Subsequent stages add customization, physics, shaders, and final rendering/performance work. Work only on the requested stage.

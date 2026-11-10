# APEX / 01

**Interactive Motorsport Helmet Experience** · Engineered for the edge.

A university final project exploring a racing helmet through three planned modes: Explore, Design, and Impact Lab. Stage 0 establishes the visual identity and technical foundation; the 3D experience is not implemented yet.

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

React 19, TypeScript 5.9 in strict mode, Vite 7, Tailwind CSS 4, and GLSL imports through `vite-plugin-glsl`. Three.js, React Three Fiber, Drei, Rapier, postprocessing, Zustand, and Motion are installed for later stages; none enter the Stage 0 application bundle. Lucide supplies the navigation icons.

Implemented: responsive DOM shell, semantic navigation, keyboard skip link and focus styles, graphite/ivory tokens, restrained signal orange, self-hosted Barlow typography, future viewer reservation, and explicitly upcoming mode previews. No WebGL canvas, model loading, camera controls, configurator, physics, shaders, or postprocessing yet. No deployment has been performed.

Source helmet candidates remain local in ignored `assets/candidates/`; a clean clone does not include them. The selected F1 model requires runtime preparation before integration. Fonts are bundled from `@fontsource/barlow` and `@fontsource/barlow-condensed`; their OFL notices are retained in `public/fonts/`.

## Development guide

- [Architecture and compatibility](docs/architecture.md)
- [Helmet comparison, selection, and asset preparation](docs/asset-review.md)
- [Stages 0–7 and completion criteria](docs/roadmap.md)
- [Contributor and agent instructions](AGENTS.md)

Next: Stage 1 introduces a restrained product scene with an optimized helmet, loading/error handling, lighting, shadows, and responsive framing. Subsequent stages add inspection, customization, physics, shaders, and final performance/deployment work. Work only on the requested stage.

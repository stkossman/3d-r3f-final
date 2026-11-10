# APEX / 01 project instructions

APEX / 01 is an Interactive Motorsport Helmet Experience for a university final project. Read README.md, docs/architecture.md, docs/asset-review.md, and docs/roadmap.md before changing the relevant area. The requested development stage is the scope boundary. Stage 1 adds a primitive product scene and camera controls; actual model integration starts in Stage 2. Do not add configuration, physics, shaders, or postprocessing before their requested stages.

## Workflow

- Inspect the code, installed versions, Git status, and existing changes first. Preserve user work.
- Use Bun exclusively: `bun install --frozen-lockfile`, `bun add`, `bunx`, and `bun run`. Preserve bun.lock; do not add other lockfiles or upgrade packages without a concrete need.
- Before delivery run `bun run typecheck`, `bun run lint`, and `bun run build`. Report actual results and anything unverified. Do not introduce a testing framework without meaningful behavior to verify. Do not run Playwright or extensive browser automation for Stage 0.
- Do not commit, push, create/update PRs, or deploy without an explicit request. Stage 1 works on `feat/apex-scene-foundation`.
- Keep changes focused, proportionate, and reviewable. Stop at requested review boundaries. Suggest a Conventional Commit message after implementation.

## Code and design

- Strict TypeScript, descriptive names, function components, relative imports, and existing ESLint conventions. Avoid any, unsafe casts, unnecessary effects/memoization, and invented shared types.
- Prefer composition, small cohesive modules, and local/derived state. Add feature directories only when they contain implemented behavior. No generic frameworks, pass-through helpers, speculative stores, or new dependencies for appearance.
- Separate semantic DOM UI from R3F components. All product copy and user controls remain accessible HTML. Preserve the Industrial Editorial / Motorsport Minimalism direction.
- Tailwind CSS first: use utilities directly in JSX/TSX for layout, spacing, sizing, typography, colors, borders, responsive behavior, interaction states, and standard transitions. Keep design tokens and global base styles in src/index.css, inside appropriate Tailwind layers. CSS is reserved for tokens, fonts, resets, reusable keyframes, complex animations, third-party requirements, or exceptional styles utilities cannot express cleanly. Do not add component stylesheets, CSS modules, utility-duplicating stylesheets, or inline React style objects for ordinary DOM styles. Runtime-calculated 3D values are allowed.
- Use the existing graphite/ivory/steel palette and sparse signal orange. Bundle fonts through Fontsource packages with their license notices; do not download separate font binaries. Maintain responsive composition, keyboard focus, contrast, and reduced-motion support. Never present planned functionality as working controls.

## Three.js and assets

- Inspect actual mesh/material names, transforms, bounds, and texture formats before integration. Use docs/asset-review.md as evidence, not as a substitute for visual validation.
- Keep source GLBs and archives out of Git and public/. Preserve originals. Only separately prepared runtime derivatives with verified provenance and credits may be shipped.
- Let a single Canvas own rendering. Fiber hooks belong below Canvas. Use refs/useFrame for continuous updates; avoid per-frame React state. Account for invalidation when using demand rendering.
- Add loading, error, and WebGL fallbacks when the real viewer is introduced. Manage cached-resource ownership: do not mutate/dispose shared assets blindly; isolate configurable materials.
- Profile textures, draw calls, frame time, shadows, DPR, and transparency before adding effects. Match color spaces and physical material behavior under controlled lighting. Avoid unnecessary double-sided materials and postprocessing.
- Physics owns rigid-body transforms with normalized units, fixed steps, and suitable colliders. Rendering geometry is not automatically a safe dynamic collider. Impact output is illustrative.
- Shader code must declare coordinate-space assumptions, keep uniforms stable, respect bounds/shadows, and preserve a fallback. GLSL imports are already configured; do not add a demo shader to prove configuration.

## Installed focused skills

Use `.agents/skills/threejs-web/SKILL.md`, `threejs-r3f/SKILL.md`, and `threejs-product-viewer/SKILL.md` for relevant scene work. Read `threejs-physics/SKILL.md` and `threejs-shaders/SKILL.md` when their stages are requested; during Stage 0 they inform architecture only. Match APIs to installed package versions and peer ranges. Skills do not expand the requested stage or authorize publication.

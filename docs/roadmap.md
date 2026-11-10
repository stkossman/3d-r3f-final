# Delivery roadmap

This numbering follows the requested Stages 2–4 brief and supersedes the earlier roadmap: materials/lighting are Stage 3, interaction/configuration Stage 4, and Impact Lab Stage 5. Each stage requires typecheck, lint, build, whitespace checks and appropriate rendered verification.

| Stage | Scope | Status / completion boundary |
| --- | --- | --- |
| 0 — Foundation | DOM shell, tokens, typography, tooling, source review | Complete; original models remain ignored |
| 1 — Scene foundation | Lazy Canvas, primitive podium, orbit/zoom/reset and fallbacks | Complete; preserved on feat/apex-scene-foundation |
| 2 — Helmet integration | License confirmation, optimization, hierarchy/normalization, loading/errors | Complete: 60,024,940 → 9,286,304 bytes; Meshopt + 2K WebP; four meshes and 98,724 triangles preserved; source/render comparisons and gates passed |
| 3 — Materials & lighting | Physical materials, static studio reflections, lights, shadows | Complete: owned materials, procedural environment, 2048² key shadow, ACES/sRGB, capped DPR; visual review and gates passed |
| 4 — Interactive experience | Explore/Design, camera transitions, notes, material presets/custom choices | Implemented and browser verified. Visor opening unavailable because glass also contains fixed inserts/trim requiring separation. Combined verification is recorded in architecture.md |
| 5 — Impact Lab | Rapier, calibrated units, colliders, impact controls, reset, illustrative output | Not started. Verify fixed steps, fast collisions/resting, reset/tab resume and transform ownership. No safety-performance claims |
| 6 — Shader & rendering study | Purposeful GLSL/fallback, optional selective postprocessing, device profiling | Not started. Declare spaces/uniforms/bounds and measure frame/memory budgets before effects |
| 7 — Delivery & defense | Accessibility/device QA, academic evidence, source explanation, credits, authorized deployment | Not started. Publication requires an explicit request; third-party livery/trademark rights remain separate |

Academic evidence now includes primitives, complex model loading/optimization, lights/shadows, PBR materials, camera animation and interactive configuration. Visor articulation is not claimed. Physics and custom GLSL remain future requirements.

Before Stage 5, justify physical dimensions/mass independently of display scale and choose primitive/compound or suitable convex colliders. Preserve configuration and resource ownership. Physical mobile performance still requires measurement. No commit, push, PR or deployment was performed for Stages 2–4.

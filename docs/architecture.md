# Architecture

## Modules and boundaries

| Module | Responsibility |
| --- | --- |
| App / ProductViewer | Semantic five-checkpoint narrative, fixed header/anchors, local configuration/lighting/annotation/Inspect state, lazy scene and fallbacks |
| scrollChoreography / CinematicRig | Typed checkpoint poses, allocation-free sampling, presentation-group transforms and cinematic camera ownership |
| DesignControls / LightingControls / configuration data | Typed material/light choices, curated presets, verified descriptions and measured display-space anchors |
| SceneCanvas | Single Canvas, renderer settings and context-loss handling |
| SceneCamera | Responsive framing, OrbitControls, interruptible camera transitions and typed ref bridge |
| HelmetModel / helmetMaterials | GLB loading, normalization, owned material instances and source part mapping |
| HelmetNotes | Occlusion-aware HTML markers and a projected/clamped HTML note card |
| ProductStage | Studio lighting and static reflection environment |
| ImpactWorld / impactSimulation / ImpactControls | Meter-space Rapier world, compound helmet body, local lifecycle/telemetry and accessible lab controls |
| useReducedMotion | Live media-query subscription |
| scripts/prepare-helmet.mjs | Offline optimization, texture validation and hash/structure report |

Relative imports, strict TypeScript and existing ESLint rules remain. Motion is the existing animation dependency. No global store, backend, new runtime dependency or testing framework was added. The optimizer packages are development-only. Stage 5 uses the installed Rapier wrapper; Stage 6 extends the owned shell PBR shader; postprocessing remains omitted.

## Visual and DOM contract

Industrial Editorial / Motorsport Minimalism retains graphite, ivory, steel and sparse signal orange. Fontsource Barlow Latin 400 and Barlow Condensed Latin 600 remain locally bundled with OFL notices. Below 900px the scene occupies the upper 44svh beneath the fixed header; document sections and controls sit below it. Desktop framing alternates the product between left and right.

Ordinary DOM styling uses Tailwind utilities. Global CSS contains tokens and browser/base styles; no component stylesheet or ordinary inline layout style was added. Drei owns marker projection styles; note positioning uses an imperative screen-space transform. Motion owns animated DOM opacity. Controls use buttons, fieldsets, labels, native selects, visible focus and pressed states. Impact Lab is an explicitly illustrative rigid-body experiment. Component notes describe visible geometry without safety/manufacturing claims.

## Assets and ownership

Drei useGLTF loads /models/helmet.glb with Draco disabled and bundled Meshopt decoding enabled. WebP uses browser decoding; no CDN decoder or external lighting asset is requested. Each viewer clones the cached object hierarchy, shares immutable geometry/source maps, and creates four owned materials in a layout effect. Cleanup restores borrowed material references and disposes owned materials and the owned tonal texture. Cached source assets are not mutated or disposed. Strict Mode effect replay is supported.

One alignment group uses measured vertex bounds: longest axis 1.85 presentation units, centered X/Z, bottom Y 0.345 above the podium top at 0.34. Exporter ancestors and part transforms remain intact; front is negative Z, confirmed visually. Approximate normalized bounds: X ±0.679, Y 0.345–1.734, Z ±0.925. These units are not calibrated meters. Hotspots use this normalized display space.

Four actual mesh names map shell, components, interior and glass. Shell paint uses a physical material, original normal/detail maps, low metalness and clearcoat; its exterior uses front faces. Interior stays rough and nonmetallic. Components retain source alpha. Glass uses reflective smoke, source alpha/graphics and no transmission pass; depth writes are off. Internal/transparent parts retain source double-sidedness.

The glass mesh also contains fixed crown inserts and chin trim, as confirmed by an isolated browser view. No hinge is authored. Rotating the entire mesh would detach those pieces, so visor opening is omitted pending geometry separation/remodeling. Tint intentionally covers visor and trim and is labeled accordingly.

## Configuration

ProductViewer owns a typed local configuration passed explicitly into the scene. Factory preserves the original Zhou livery. Stealth uses graphite/satin/smoke; Apex uses signal/gloss/copper. Custom options also include ivory and silver.

A separate 2K monochrome/tonal shell map preserves graphic shapes while allowing recoloring; custom variants intentionally change the original hues/contrast. Normal maps remain. Satin uses scalar roughness instead of the baked roughness map; gloss restores that source map. Factory restores original colors and baseline parameters.

Selections mutate only owned material parameters and invalidate rendering, without reloading the GLB or allocating geometry/materials per selection. Checkpoint navigation preserves configuration and keeps the Canvas mounted. Lighting has separate local preset/intensity state, with a dedicated reset. Reset view resets the camera; Restore factory resets materials.

## Scroll, camera and annotation ownership

A single fixed presentation layer remains mounted through Introduction, Explore, Design, Lighting and Impact Lab. Native document scrolling and ordinary hash anchors preserve wheel/touch scrolling, history and deep-link refresh. There is no nested narrative scroller or scroll-jacking. ResizeObserver measures actual section positions, including mobile sections taller than the viewport. Motion `useScroll().scrollY` subscriptions map those offsets into one continuous 0–1 motion value. React state changes only when the nearest checkpoint changes; scroll frames do not set React state.

`scrollChoreography.ts` defines five yaw/scale/framing/distance poses. Smoothstep interpolation is reversible, with a modest pull-back between Design and Lighting. `CinematicRig` samples into a reused object and updates a named `helmet-presentation` group, leaving the GLB hierarchy intact. Helmet anchors and podium share that group, keeping component coordinates and contact coherent. Lights/reflections remain in studio space. The fixed camera target is (0, 0.8, 0), home direction proportional to (4, 2.4, -5), 35° FOV and near/far 0.1/40. Perspective view offsets move the composition sideways; responsive framing fits the tighter axis.

Cinematic mode disables OrbitControls and removes the canvas from hit testing, while HTML markers/cards remain interactive. Explicit Inspect grants OrbitControls sole camera ownership and freezes presentation transforms; the document can still scroll outside the scene. Camera buttons provide bounded rotation, zoom, reset and front/side/rear/three-quarter presets. Damping and interruptible spherical preset transitions remain. Return to cinematic exponentially blends the camera, yaw, scale and horizontal framing toward the current scroll position, preserving configuration. Inspect retains the current presentation yaw; camera presets are studio-relative rather than resetting the product group.

Below 900px horizontal framing is centered and scale restrained. An open cinematic note reduces the presentation scale and raises framing to leave room for the HTML card. On short landscape viewports (600–899px wide, at most 600px high), opening a note temporarily expands the scene below the header and hides the narrative/footer until Close or Escape; document layout and scroll offsets remain intact. Reduced motion removes cinematic yaw/scale choreography, switches composition immediately at checkpoint boundaries, and disables note/preset transition durations. Essential content and controls remain semantic HTML.

`HelmetNotes` uses Drei Html markers and direct world-to-screen projection for the card. Cards clamp within usable scene bounds, with a fixed bottom area on compact screens. Marker raycast occlusion changes to a subdued dashed state instead of removing keyboard access. The selected marker/card share a component heading and NOTE number; descriptions remain the verified source-part text. Only one card is mounted, with a short opacity entrance/exit. Escape and Close restore focus to its marker. Obsolete below-viewer notes and selection buttons were removed.

Demand rendering remains. Motion subscriptions invalidate on cinematic scroll; R3F changes, resize and controls invalidate as needed, and return/preset transitions request frames only until settled. Frame values use refs and reused vectors/pose objects. GLB, geometry, materials and reflection capture do not remount at section boundaries. Stage 5 adds a separate root-level physics body and mirrors its poses into the existing presentation group during Impact Lab; see the ownership contract below.

## Lighting and renderer

Three procedural Lightformers are captured once into a 256px environment. They create studio reflections without an HDRI download or continuous capture. The original Studio setup uses a warm key, cool rim, front fill and restrained hemisphere. LightingControls selects Studio, Contrast (stronger key/reduced fill) or Warm (warmer key/softer balance). A 0.65–1.35 multiplier changes key intensity; presets also change real key/rim colors and rim/fill/hemisphere intensities. Reset restores Studio at 1×. Reflection capture, color management and the single shadow caster are preserved. Only the key casts shadows: 2048² PCF map, ±3 bounds, near/far 0.5/15, bias -0.0002 and normal bias 0.015. Glass does not cast an opaque shadow; shell/podium cast onto the platform/floor. The darker podium top supports the product.

WebGL renderer: antialiasing, opaque background, sRGB output, ACES filmic mapping, exposure 1.1, DPR 1–1.5. Fog joins floor and studio background. No bloom, custom shaders, transmission pass or postprocessing.

## Compatibility and verification

Installed versions checked at entry: React/DOM 19.3.1, Three/types 0.187.0, Fiber 9.8.2, Drei 10.7.9, Vite 7.3.8. Core peer ranges remain compatible. No existing packages were upgraded. Preparation adds glTF Transform 4.5.1, Meshoptimizer 1.3.0 and Sharp 0.35.5 as development tools. Bun 1.3.5 was used.

Stages 2–4 historical verification: each passed typecheck, lint, build and whitespace checks. Browser plugin unavailable: connected Playwright/Chromium was used without installing a framework. Source/2K/1K views were compared. Checks exercised all 24 material combinations, presets, mode persistence, factory reset, camera views/reset, pointer interruption, reduced motion, notes, delayed loading, blocked-model failure and context loss. Failed scenes disable camera/material controls. Overflow was checked at 320/375/768/844/1440/1920px. Touch emulation checked scrolling opt-in, rotation, pinch zoom and preset selection with no page errors; it is not a physical-device performance test.

A settled desktop sample reported 24 render calls and 217,550 triangles including shadow/transparency passes, 19 geometries and 20 texture objects. A 500ms idle sample rendered zero additional frames. Texture counts are not GPU memory measurements. Twelve 2K RGBA textures imply about 192 MiB before mipmaps (256 MiB with mipmaps), plus tonal/environment/renderer allocations. WebP reduces transfer, not GPU residency; KTX2 or lower-resolution device variants remain profiling options.

Known warnings: upstream Fiber constructs deprecated THREE.Clock; Vite advises about the lazy scene chunk exceeding 500kB. Neither is suppressed. The DOM shell renders before the lazy scene. Sustained frame time, thermal behavior, real mobile GPU memory and other browser engines remain unverified; no universal 30/60fps claim is made.

Stage 5 separates meter-space physics from display units. The rigid-body experiment is not a safety certification.

## Stage 4.5 verification

A, B and C were implemented sequentially with typecheck, lint, build and whitespace gates. The Browser plugin was unavailable and connected Playwright had an occupied profile; isolated existing Playwright/Chromium was used without adding dependencies. Temporary scripts/screenshots remain outside the repository. The Bun Playwright runner timed out launching Chromium on Windows, so the existing browser scripts used Node; all project/package commands used Bun.

Rendered checks exercised all notes, switching/toggle/Close/Escape, keyboard activation/focus restoration, camera presets/zoom, continuous forward/reverse midpoint poses, Inspect freeze/return, native wheel, hash navigation/refresh, material and lighting persistence, actual light intensities/colors, reduced-motion yaw, emulated native touch scrolling, reachable mobile configuration controls, back/forward navigation, landscape note bounds and delayed/failed GLB/context loss. Screenshots were inspected for desktop narrative checkpoints and mobile notes/controls. Widths 320/375/768/1024/1440/1920px had no horizontal overflow. The same Canvas/helmet/material UUIDs remained, with one GLB request. A settled 700ms sample rendered zero additional WebGL frames. This is idle behavior, not a sustained FPS guarantee. Existing large-chunk and THREE.Clock advisories remain; physical touch hardware, sustained mobile performance/GPU residency and other browser engines remain unverified.

## Stage 5: Impact Lab

`ImpactWorld` uses installed @react-three/rapier 2.2.0 / Rapier 0.19.2. The Physics wrapper is paused to disable automatic stepping; one priority -1 callback calls its public `step` API at 1/60 s. An accumulator allows at most four steps per rendered frame, discarding excess wall time after stalls. Interpolation is disabled; the render mirror reads the latest pose at priority -0.5. No independent background loop runs.

Physics uses meters/kg/seconds and gravity (0, -9.81, 0). Assumed helmet length is 0.34 m and mass 1.5 kg, independent of the visual asset's original units. Two cuboids approximate the crown/rear shell and projecting chin. Half-extents/offsets/masses are (0.115, 0.105, 0.12)/(0, 0.015, 0.035)/1.2 kg and (0.105, 0.055, 0.07)/(0, -0.065, -0.1)/0.3 kg. Rapier derives center of mass/inertia from these solid shapes. They omit the hollow interior, compliance and precise shell contours. The fixed slab is 2.4 x 0.1 x 2.4 m with its top at Y=0; rendered and physical bounds agree. No dynamic triangle mesh is used.

Friction is 0.65, adjustable restitution 0�0.5, and linear/angular damping 0.5/0.8. These illustrative values keep the experiment on the finite surface. CCD, two CCD substeps and six solver iterations support the constrained speeds. Release height (0.2�0.9 m) measures the body origin above the slab, rather than clearance beneath the tilted shell. Release Euler angles are (0.16, -0.5, 0.12) radians. No safety, force, G-force or absorption output is inferred.

Bodies live at the unscaled scene root, outside all presentation transforms. The persistent visual helmet remains in its existing group: calibrated at 0.34/1.85 meters per normalized model unit, centered at Y=1.04, then rendered at five display units per meter. CinematicRig only reads the body's translation/quaternion during Impact Lab; it never writes into Rapier. The camera/presentation blend into the lab before controls activate; thereafter the render pose follows physics directly. The camera follows horizontal motion with damping; reduced motion uses immediate presentation/camera changes. Inspect is disabled in the lab. Scroll exit resets/disables physics and blends back to the current narrative. Native scroll, Lenis, anchors and configuration ownership remain intact.

The HTML panel provides height, bounce, Start, Pause/Resume, Reset and Replay. Settings are editable only when ready. Reset preserves settings while restoring pose and clearing velocities, forces, torques, counters, contact tracking and feedback. Replay resets before waking the same body. Ref-based commands guard rapid interactions. Hidden tabs pause and discard accumulated time; return requires explicit Resume. Cleanup releases listeners/world resources without remounting the helmet. Active simulation, camera transitions and a brief standard-material orange ring request frames; ready/paused/settled scenes otherwise return to demand rendering. React telemetry updates only for lifecycle changes and real contact episodes, combining compound contacts with a 100 ms chatter debounce. Impact speed is omitted because callbacks run after collision resolution.

Verification: `bun scripts/verify-impact.ts` checks the real engine with shared collider/damping definitions: 165 slider combinations, three runs each, assert collision events, induced rotation, configured bounce, no escape/tunneling, sleep within 30 simulated seconds, zero reset velocities and 1.5 kg mass. Maximum observed horizontal excursion: 0.958 m. Bun emitted a parent-directory EPERM diagnostic after assertions completed, with exit code 0. Typecheck, lint, build and whitespace gates passed; the large lazy-chunk advisory remains (scene chunk approximately 3.37 MB / 1.15 MB gzip including Rapier). No Stage 5 browser automation ran, as requested. Manual acceptance remains for responsive framing, transitions, rapid controls, scroll reentry, tab visibility, reduced motion, resource continuity and fallbacks; device performance remains unmeasured. Stage 6 can follow manual acceptance of this ownership boundary. No custom shaders/postprocessing were added.

## Stage 6: scan, rendering and initial reveal

`useDiagnosticScan` installs the GLSL extension on the owned shell material after material creation. The same uniforms survive rerenders and material parameter changes. Explore's Diagnostic scan runs a finite 2.2-second sweep; actual Impact telemetry starts a 0.55-second response. Leaving the relevant checkpoint or hiding the tab clears it. Reduced motion shows a stationary band briefly. Inactive shader time is frozen and no shader frames are requested. Compilation failure restores the ordinary PBR program and marks the optional control unavailable. See [shader-study.md](shader-study.md) for coordinate spaces, formulas, uniforms and defense notes.

The static 256px reflection capture is memoized: React telemetry/control updates no longer recreate its children and recapture six cube faces. Owned materials enable Three's output dithering for dark gradients. The existing 2048-square key shadow expands from +/-3 to +/-7 (far 25) only in Impact Lab, covering its larger travel/platform at the cost of lower shadow texel density. ACES exposure 1.1, sRGB output, antialiasing, DPR 1-1.5 and source PBR parameters remain. No bloom/composer is added: its extraction/blur/composite passes have no demonstrated visual benefit for this restrained surface scan. New GPU/frame-time measurements were not made.

`CinematicPreloader` replaces a critical, static document shell as soon as React commits. The small boot CSS is exceptional: it must style the first document before Tailwind/JavaScript arrive, then is removed. Drei useProgress reports completed resource counts; the overall bar is honestly indeterminate until readiness, since resource counts do not measure GPU preparation. There are no simulated percentages. `SceneReadiness` mounts after model/texture/Rapier Suspense, waits for compileAsync and fonts, observes an actual scene render, then allows two browser presentation frames before ready. Optional scan failure receives a replacement PBR frame before release; base shader failures use the scene fallback. Context loss, asset errors, lazy-module errors and a 45-second initialization watchdog also release to fallback. Boot-module failure exposes a reload link.

The once-per-document overlay fills its line on completion, briefly labels readiness, then wipes vertically in 0.62 seconds after 0.12 seconds. Reduced motion reveals immediately. Hidden content is inert/aria-hidden; overlay-local wheel/touch/key prevention is removed with the overlay, without changing body overflow or stopping Lenis. Initial hash alignment runs while covered; focus moves to main with preventScroll after reveal. Anchor navigation does not remount the loader or Canvas.

Stage 6 static verification: typecheck, lint, build and whitespace gates passed. The overall bundle is slightly larger; useProgress moves shared Three code into the initial chunk (approximately 813 KB / 243 KB gzip), while the lazy scene is approximately 2.99 MB / 1.05 MB gzip. Both retain Vite size advisories. No browser automation ran, per request. GPU compilation, fallback injection, reveal timing, keyboard/screen-reader behavior, responsive composition, idle frames and physical-device performance require manual acceptance; previous browser evidence does not verify these new changes.

import {
  DEFAULT_LIGHTING,
  LIGHTING_PRESETS,
  type LightingConfiguration,
} from '../scene/studioLighting'

type LightingControlsProps = {
  configuration: LightingConfiguration
  onChange: (configuration: LightingConfiguration) => void
  ready: boolean
}

export function LightingControls({
  configuration,
  onChange,
  ready,
}: LightingControlsProps) {
  return (
    <fieldset disabled={!ready} className="mt-6 border-t border-line pt-4">
      <legend className="text-xs text-steel">Lighting presets</legend>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(LIGHTING_PRESETS).map(([id, preset]) => (
          <button
            key={id}
            type="button"
            aria-pressed={configuration.preset === id}
            className="min-h-11 cursor-pointer border border-line px-2 text-xs hover:border-steel aria-pressed:border-signal aria-pressed:text-signal disabled:opacity-40"
            onClick={() => {
              if (id === 'studio' || id === 'contrast' || id === 'warm')
                onChange({ ...configuration, preset: id })
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-steel" aria-live="polite">
        {LIGHTING_PRESETS[configuration.preset].description}
      </p>
      <label
        className="mt-6 flex items-center justify-between gap-3 text-xs text-steel"
        htmlFor="key-intensity"
      >
        Key light intensity{' '}
        <output htmlFor="key-intensity" className="tabular-nums text-ivory">
          {configuration.intensity.toFixed(2)}×
        </output>
      </label>
      <input
        id="key-intensity"
        type="range"
        min="0.65"
        max="1.35"
        step="0.05"
        value={configuration.intensity}
        className="min-h-11 w-full cursor-pointer accent-signal disabled:opacity-40"
        onChange={(event) =>
          onChange({ ...configuration, intensity: event.target.valueAsNumber })
        }
      />
      <button
        type="button"
        className="mt-2 min-h-11 cursor-pointer border-b border-steel text-xs hover:text-signal disabled:opacity-40"
        onClick={() => onChange(DEFAULT_LIGHTING)}
      >
        Reset lighting
      </button>
    </fieldset>
  )
}

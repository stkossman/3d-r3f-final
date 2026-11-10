import {
  FACTORY_CONFIGURATION,
  MATERIAL_PRESETS,
  type HelmetConfiguration,
} from '../model/helmetConfiguration'

type DesignControlsProps = {
  configuration: HelmetConfiguration
  onChange: (configuration: HelmetConfiguration) => void
  ready: boolean
}

export function DesignControls({
  configuration,
  onChange,
  ready,
}: DesignControlsProps) {
  const activePreset = MATERIAL_PRESETS.find(
    ({ configuration: preset }) =>
      preset.shell === configuration.shell &&
      preset.finish === configuration.finish &&
      preset.visor === configuration.visor,
  )
  const selectClass =
    'mt-2 min-h-11 w-full cursor-pointer border border-line bg-graphite px-2 text-xs text-ivory disabled:opacity-40'

  return (
    <div
      className="mt-4 border-t border-line pt-4"
      role="region"
      aria-label="Helmet design"
    >
      <fieldset disabled={!ready}>
        <legend className="text-xs text-steel">Material presets</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {MATERIAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={activePreset?.id === preset.id}
              onClick={() => onChange(preset.configuration)}
              className="min-h-11 cursor-pointer border border-line px-2 py-3 text-left text-xs text-ivory hover:border-steel aria-pressed:border-signal aria-pressed:text-signal disabled:opacity-40"
            >
              {preset.name}
            </button>
          ))}
        </div>
        <p className="mt-2 min-h-5 text-xs text-steel" aria-live="polite">
          {activePreset?.description ?? 'Custom combination'}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 min-[400px]:grid-cols-3">
          <label className="text-xs text-steel">
            Shell tone
            <select
              className={selectClass}
              value={configuration.shell}
              onChange={(event) => {
                const shell = event.target.value
                if (
                  shell === 'original' ||
                  shell === 'ivory' ||
                  shell === 'graphite' ||
                  shell === 'signal'
                )
                  onChange({ ...configuration, shell })
              }}
            >
              <option value="original">Original livery</option>
              <option value="ivory">Ivory graphic</option>
              <option value="graphite">Graphite graphic</option>
              <option value="signal">Signal graphic</option>
            </select>
          </label>
          <label className="text-xs text-steel">
            Surface finish
            <select
              className={selectClass}
              value={configuration.finish}
              onChange={(event) => {
                const finish = event.target.value
                if (finish === 'gloss' || finish === 'satin')
                  onChange({ ...configuration, finish })
              }}
            >
              <option value="gloss">Gloss</option>
              <option value="satin">Satin</option>
            </select>
          </label>
          <label className="text-xs text-steel">
            Visor & trim tint
            <select
              className={selectClass}
              value={configuration.visor}
              onChange={(event) => {
                const visor = event.target.value
                if (
                  visor === 'smoke' ||
                  visor === 'silver' ||
                  visor === 'copper'
                )
                  onChange({ ...configuration, visor })
              }}
            >
              <option value="smoke">Smoke</option>
              <option value="silver">Silver</option>
              <option value="copper">Copper</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-[42ch] text-xs leading-relaxed text-steel">
            Custom tones retain the graphic pattern in monochrome. Factory
            restores the original colors.
          </p>
          <button
            type="button"
            className="min-h-11 cursor-pointer border-b border-steel text-xs text-ivory hover:text-signal"
            onClick={() => onChange(FACTORY_CONFIGURATION)}
          >
            Restore factory
          </button>
        </div>
      </fieldset>
    </div>
  )
}

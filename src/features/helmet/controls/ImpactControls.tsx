import { useState } from 'react'
import type { ImpactAction, ImpactSettings, ImpactTelemetry } from '../physics/impactSimulation'

const buttonClass = 'min-h-11 cursor-pointer border border-line px-3 text-xs text-ivory hover:border-steel hover:text-signal disabled:cursor-default disabled:opacity-40'

type ImpactControlsProps = {
  settings: ImpactSettings
  telemetry: ImpactTelemetry
  available: boolean
  framed: boolean
  onSettings: (settings: ImpactSettings) => void
  onCommand: (action: ImpactAction) => void
}

export function ImpactControls({ settings, telemetry, available, framed, onSettings, onCommand }: ImpactControlsProps) {
  const [draftHeight, setDraftHeight] = useState(settings.height)
  const running = telemetry.status === 'running'
  const editable = available && telemetry.status === 'ready'

  function commitHeight(height: number) {
    setDraftHeight(height)
    if (height !== settings.height) onSettings({ ...settings, height })
  }

  return <div className="mt-6 border-t border-line pt-4">
    <fieldset disabled={!editable} className="grid gap-4 disabled:opacity-50">
      <legend className="sr-only">Drop configuration</legend>
      <label className="grid gap-2 text-xs text-steel" htmlFor="drop-height">
        <span className="flex justify-between">Release height / center <span className="text-ivory">{draftHeight.toFixed(2)} m</span></span>
        <input id="drop-height" type="range" min="0.2" max="0.9" step="0.05" value={draftHeight}
          onChange={(event) => setDraftHeight(Number(event.target.value))}
          onPointerUp={(event) => commitHeight(Number(event.currentTarget.value))}
          onPointerCancel={(event) => commitHeight(Number(event.currentTarget.value))}
          onKeyUp={(event) => commitHeight(Number(event.currentTarget.value))}
          onBlur={(event) => commitHeight(Number(event.currentTarget.value))}
          className="min-h-6 w-full cursor-pointer accent-signal" />
      </label>
      <label className="grid gap-2 text-xs text-steel" htmlFor="drop-bounce">
        <span className="flex justify-between">Restitution / bounce <span className="text-ivory">{settings.restitution.toFixed(2)}</span></span>
        <input id="drop-bounce" type="range" min="0" max="0.5" step="0.05" value={settings.restitution} onChange={(event) => onSettings({ ...settings, restitution: Number(event.target.value) })} className="min-h-6 w-full cursor-pointer accent-signal" />
      </label>
    </fieldset>
    <div className="mt-4 grid grid-cols-2 gap-2">
      <button type="button" disabled={!available || !framed || draftHeight !== settings.height || telemetry.status !== 'ready'} onClick={() => onCommand('start')} className={`${buttonClass} border-signal text-signal`}>Start simulation</button>
      <button type="button" disabled={!available || (!running && telemetry.status !== 'paused')} onClick={() => onCommand(running ? 'pause' : 'resume')} className={buttonClass}>{telemetry.status === 'paused' ? 'Resume' : 'Pause'}</button>
      <button type="button" disabled={!available} onClick={() => onCommand('reset')} className={buttonClass}>Reset</button>
      <button type="button" disabled={!available || !framed || telemetry.status === 'ready'} onClick={() => onCommand('replay')} className={buttonClass}>Replay</button>
    </div>
    <p role="status" className="mt-4 text-xs text-steel"><span className="capitalize text-ivory">{telemetry.status}</span> / {telemetry.collisions === 0 ? 'Awaiting contact' : `${telemetry.collisions} impact${telemetry.collisions === 1 ? '' : 's'} detected`}</p>
    <p className="mt-3 text-xs leading-relaxed text-steel">Reset to adjust. Replay uses the current settings. Switching tabs pauses the experiment; resume when ready.</p>
  </div>
}

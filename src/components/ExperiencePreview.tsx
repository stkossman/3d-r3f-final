const modes = [
  { name: 'Explore', detail: 'Every angle. Every detail.', description: 'Get closer with an interactive view, technical hotspots, and a moving visor.' },
  { name: 'Design', detail: 'Make your mark.', description: 'Explore finishes, shell colors, and visor treatments in your own combination.' },
  { name: 'Impact Lab', detail: 'Put motion to the test.', description: 'Experiment with gravity, collisions, and the forces behind an impact.' },
] as const

export function ExperiencePreview() {
  return (
    <section className="scroll-mt-8 border-t border-line pt-16 pb-20 max-[680px]:py-12" id="experience" aria-labelledby="experience-title">
      <div className="flex items-end justify-between gap-8 max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-5">
        <h2 className="text-[clamp(2rem,3.3vw,3rem)] leading-[1.1] tracking-[-0.025em]" id="experience-title">One helmet.<br />Three perspectives.</h2>
        <p className="text-sm leading-[1.7]">The experience ahead.<br /><span className="text-steel">All modes are in development.</span></p>
      </div>
      <ul className="mt-10 grid list-none grid-cols-3 gap-10 p-0 max-[900px]:gap-6 max-[680px]:grid-cols-1 max-[680px]:gap-8">
        {modes.map((mode) => (
          <li className="border-t border-line pt-5" key={mode.name}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xl">{mode.name}</h3><span className="text-[0.6875rem] text-steel">Upcoming</span></div>
            <p className="mt-6 text-[0.9375rem] max-[680px]:mt-4">{mode.detail}</p>
            <p className="mt-2 max-w-[36ch] text-sm leading-[1.65] text-steel max-[680px]:max-w-[48ch]">{mode.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

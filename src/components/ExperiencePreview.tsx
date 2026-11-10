const modes = [
  { name: 'Explore', status: 'Available', detail: 'Every angle. Every detail.', description: 'Rotate the helmet, move between camera views, and inspect its visible components through anchored notes.' },
  { name: 'Design', status: 'Available', detail: 'Make your mark.', description: 'Choose a material preset or combine shell tones, surface finishes, and reflective visor tints in the viewer above.' },
  { name: 'Impact Lab', status: 'Upcoming', detail: 'Put motion to the test.', description: 'A future illustrative study of gravity and collisions. Simulation is not available yet.' },
] as const

export function ExperiencePreview() {
  return (
    <section className="scroll-mt-8 border-t border-line pt-16 pb-20 max-[680px]:py-12" id="experience" aria-labelledby="experience-title">
      <div className="flex items-end justify-between gap-8 max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-5">
        <h2 className="text-[clamp(2rem,3.3vw,3rem)] leading-[1.1] tracking-[-0.025em]" id="experience-title">One helmet.<br />Three perspectives.</h2>
        <p className="text-sm leading-[1.7]">Choose a perspective in the viewer.<br /><span className="text-steel">Explore and Design are available now.</span></p>
      </div>
      <ul className="mt-10 grid list-none grid-cols-3 gap-10 p-0 max-[900px]:gap-6 max-[680px]:grid-cols-1 max-[680px]:gap-8">
        {modes.map((mode) => (
          <li className="border-t border-line pt-5" key={mode.name}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xl">{mode.name}</h3><span className="text-[0.6875rem] text-steel">{mode.status}</span></div>
            <p className="mt-6 text-[0.9375rem] max-[680px]:mt-4">{mode.detail}</p>
            <p className="mt-2 max-w-[36ch] text-sm leading-[1.65] text-steel max-[680px]:max-w-[48ch]">{mode.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

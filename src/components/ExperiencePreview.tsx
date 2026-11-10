const modes = [
  { name: 'Explore', detail: 'Every angle. Every detail.', description: 'Get closer with an interactive view, technical hotspots, and a moving visor.' },
  { name: 'Design', detail: 'Make your mark.', description: 'Explore finishes, shell colors, and visor treatments in your own combination.' },
  { name: 'Impact Lab', detail: 'Put motion to the test.', description: 'Experiment with gravity, collisions, and the forces behind an impact.' },
] as const

export function ExperiencePreview() {
  return (
    <section className="experience" id="experience" aria-labelledby="experience-title">
      <div className="section-heading">
        <h2 id="experience-title">One helmet.<br />Three perspectives.</h2>
        <p>The experience ahead.<br /><span>All modes are in development.</span></p>
      </div>
      <ul className="mode-previews">
        {modes.map((mode) => (
          <li key={mode.name}>
            <div className="mode-heading"><h3>{mode.name}</h3><span className="upcoming">Upcoming</span></div>
            <p className="mode-detail">{mode.detail}</p>
            <p className="mode-description">{mode.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

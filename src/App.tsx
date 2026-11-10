import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { ExperiencePreview } from './components/ExperiencePreview'
import { ViewerReservation } from './components/ViewerReservation'
import './App.css'

function App() {
  return (
    <div className="app-shell" id="top">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="APEX / 01 home">APEX <span>/ 01</span></a>
        <span className="header-description">Interactive Motorsport<br />Helmet Experience</span>
        <nav aria-label="Page navigation">
          <a href="#experience">The experience <ArrowDown size={14} aria-hidden="true" /></a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Engineered<br />for the <em>edge.</em></h1>
            <p className="hero-description">A closer look at the intersection of protection, precision, and personal expression.</p>
            <a className="text-link" href="#experience">Discover what’s ahead <ArrowUpRight size={18} aria-hidden="true" /></a>
            <div className="development-note"><span className="status-dot" aria-hidden="true" /> In development <span>/</span> Foundation stage</div>
          </div>
          <ViewerReservation />
          <div className="hero-footnote"><span>APEX / 01</span><span>A study in form. An exploration of force.</span></div>
        </section>
        <ExperiencePreview />
      </main>
      <footer className="site-footer">
        <a className="wordmark footer-wordmark" href="#top">APEX <span>/ 01</span></a>
        <p>An independent university project.</p>
        <span>Concept → Experience</span>
      </footer>
    </div>
  )
}

export default App

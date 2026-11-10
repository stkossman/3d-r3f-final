import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { ExperiencePreview } from './components/ExperiencePreview'
import { ProductViewer } from './features/helmet/ProductViewer'

function App() {
  return (
    <div className="mx-auto max-w-[1800px] px-page" id="top">
      <a className="fixed top-4 left-page z-10 -translate-y-[200%] bg-ivory px-4 py-3 text-graphite focus:translate-y-0" href="#main">Skip to content</a>
      <header className="flex min-h-28 items-center gap-12 border-b border-line max-[680px]:min-h-22 max-[680px]:gap-4">
        <a className="whitespace-nowrap font-display text-[1.75rem] font-semibold tracking-[-0.035em] max-[680px]:text-2xl" href="#top" aria-label="APEX / 01 home">APEX <span className="text-steel">/ 01</span></a>
        <span className="text-xs leading-[1.4] max-[900px]:hidden">Interactive Motorsport<br />Helmet Experience</span>
        <nav className="ml-auto" aria-label="Page navigation">
          <a className="flex items-center gap-5 text-sm max-[680px]:gap-2 max-[680px]:text-xs" href="#experience">The experience <ArrowDown size={14} aria-hidden="true" /></a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="grid grid-cols-[1fr_1.1fr] gap-x-[4%] pt-[clamp(3.5rem,7vw,7rem)] min-[1600px]:gap-x-[8%] max-[900px]:gap-x-8 max-[680px]:grid-cols-1 max-[680px]:pt-12" aria-labelledby="hero-title">
          <div className="pt-4 pb-12 max-[680px]:pt-0">
            <h1 className="font-display text-[clamp(4rem,7.3vw,6rem)] leading-[0.95] font-semibold tracking-[-0.025em] uppercase max-[680px]:text-[clamp(3.5rem,14.5vw,6rem)]" id="hero-title">Engineered<br />for the <em className="text-signal not-italic">edge.</em></h1>
            <p className="mt-8 max-w-[30ch] text-lg leading-[1.6] text-steel max-[680px]:max-w-[34ch]">A closer look at the intersection of protection, precision, and personal expression.</p>
            <a className="mt-8 inline-flex items-center gap-6 border-b border-steel pb-2 text-sm" href="#experience">Discover what’s ahead <ArrowUpRight size={18} aria-hidden="true" /></a>
            <div className="mt-14 flex flex-wrap items-center gap-2.5 text-xs text-steel max-[680px]:mt-8"><span className="size-[5px] rounded-full bg-signal" aria-hidden="true" /> In development <span>/</span> Scene foundation</div>
          </div>
          <ProductViewer />
          <div className="col-span-full mt-10 flex justify-between gap-4 pb-6 text-[0.6875rem] text-steel max-[680px]:mt-6 max-[680px]:items-end"><span>APEX / 01</span><span className="max-[680px]:max-w-[23ch] max-[680px]:text-right">A study in form. An exploration of force.</span></div>
        </section>
        <ExperiencePreview />
      </main>
      <footer className="flex items-center justify-between gap-6 border-t border-line py-7 max-[680px]:flex-wrap">
        <a className="whitespace-nowrap font-display text-lg font-semibold tracking-[-0.035em]" href="#top">APEX <span className="text-steel">/ 01</span></a>
        <p className="text-xs text-steel">An independent university project.</p>
        <span className="text-xs text-steel max-[680px]:hidden">Concept → Experience</span>
      </footer>
    </div>
  )
}

export default App

export function ViewerFallback({ loading = false }: { loading?: boolean }) {
  return (
    <div
      className="grid h-full min-h-60 place-content-center gap-3 px-8 text-center"
      role="status"
    >
      <p className="text-sm text-ivory">
        {loading
          ? 'Preparing the product study…'
          : 'The 3D study is unavailable.'}
      </p>
      <p className="max-w-[32ch] text-xs leading-relaxed text-steel">
        {loading
          ? 'Loading the helmet and studio.'
          : 'Reload to retry the model. Check your connection and WebGL support. You can still read the experience below.'}
      </p>
    </div>
  )
}

export function ViewerReservation() {
  return (
    <figure className="viewer-reservation" aria-labelledby="viewer-caption">
      <div className="viewer-topline"><span>Product study</span><span>001 / Helmet</span></div>
      <div className="reserved-space">
        <span className="registration-mark mark-top" aria-hidden="true" />
        <span className="reservation-number" aria-hidden="true">01</span>
        <div className="reservation-label">
          <span className="reservation-rule" aria-hidden="true" />
          <p>Space for something<br />extraordinary.</p>
        </div>
        <span className="registration-mark mark-bottom" aria-hidden="true" />
      </div>
      <figcaption id="viewer-caption"><span>3D helmet viewer</span><span>Coming in Stage 1</span></figcaption>
    </figure>
  )
}

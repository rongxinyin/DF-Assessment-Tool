// Berkeley Lab attribution footer — dark-teal band bookending the masthead.
export function Footer() {
  return (
    <footer className="px-8 py-4" style={{ background: 'var(--brand-dark)' }}>
      <p
        className="mx-auto max-w-6xl text-center text-[12px]"
        style={{ color: 'rgba(190, 215, 221, 0.75)' }}
      >
        Developed by{' '}
        <a
          href="https://www.lbl.gov"
          target="_blank"
          rel="noreferrer"
          className="font-medium transition-colors hover:text-white"
          style={{ color: 'var(--brand-light)' }}
        >
          Lawrence Berkeley National Laboratory
        </a>{' '}
        · Energy Technologies &amp; Systems Division
      </p>
    </footer>
  )
}

import Link from 'next/link'

type Props = {
  name: string
  slug: string
  color: string
}

export default function Tool({ name, slug, color }: Props) {
  return (
    <div className="tool">
      <Link
        href={'/' + slug}
        className="link"
        style={{
          background: `${color}`,
          color: 'white',
          marginBottom: '1.5rem',
          padding: '2.5rem 1.5rem',
          borderRadius: '0.5rem',
          display: 'flex',
          opacity: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '2px 4px 24px -4px rgba(0, 0, 0, 0.25)',
          transition: 'all 150ms ease-in-out',
          overflow: 'hidden',
        }}
      >
        <h2>{name}</h2>
        {/* <span className="arrow">→</span> */}
      </Link>

      <style jsx>{`
        .link:hover,
        .link:focus-visible {
          opacity: 0.85;
          transform: translateY(-0.125rem);
          box-shadow: 2px 4px 24px rgba(0, 0, 0, 0.27);
          outline: none;
        }

        .arrow {
          opacity: 0;
          transition: opacity 150ms ease-in-out;
          text-decoration: none;
          font-size: 4rem;
          line-height: 0;
        }

        .link:hover .arrow,
        .link:focus-visible .arrow {
          opacity: 0.6;
          text-decoration: none;
        }
      `}</style>
    </div>
  )
}

import Link from 'next/link';

export default function Tool({ name, path, color }) {
  return (
    <div className="tool">
      <Link href={path}>
        <a className="link">
          <h2>{name}</h2>
        </a>
      </Link>

      <style jsx>{`
        .tool {
          background: ${color};
          color: white;
          margin-bottom: 2rem;
          border-radius: 0.5rem;
          display: flex;
          flex-direction: column;
        }

        .link {
          padding: 1rem;
        }
      `}</style>
    </div>
  )
}
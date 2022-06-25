export default function Card({label, type, number, children}) {
  return (
    <>
      <div className="card">
        {label && <div className="label">{label}</div>}
        <div className="content">
          {type === 'number' ? (
            <span className="number">
              {number}
            </span>
          ): children}
        </div>
      </div>

      <style jsx>{`
        .card {
          padding: 1rem;
          color: var(--gray-50);
          background-color: var(--gray-700);
          text-align: center;
          box-shadow: 2px 4px 24px -4px rgba(0, 0, 0, 0.25);
          border-radius: 0.5rem;
        }

        .label {
          color: var(--gray-400);
          display: block;
          margin-bottom: 0.25rem;
        }

        .number {
          font-size: 2rem;
          font-weight: 600;
        }
      `}</style>
    </>
  )
}
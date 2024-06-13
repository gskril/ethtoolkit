import { Dispatch } from 'react'

export type EnsRecords = {
  name: string
  address?: string | null
  avatar?: string | null
  description?: string | null
  twitter?: string | null
  github?: string | null
  telegram?: string | null
  url?: string | null
}

type Props = {
  records: EnsRecords
  setSelectedName: Dispatch<React.SetStateAction<EnsRecords | undefined>>
}

export default function EnsProfile({ records, setSelectedName }: Props) {
  const { name, address, avatar, description, url } = records

  const twitter =
    records.twitter && records.twitter.startsWith('@')
      ? records.twitter.substring(1)
      : records.twitter

  const telegram =
    records.telegram && records.telegram.startsWith('@')
      ? records.telegram.substring(1)
      : records.telegram

  const github = records.github
    ? records.github.startsWith('@')
      ? records.github.substring(1)
      : records.github.startsWith('https://github.com')
        ? records.github.split('github.com/')[1]
        : records.github
    : null

  return (
    <>
      <div className="modal">
        <div
          className="modal__background"
          onClick={() => {
            setSelectedName(undefined)
          }}
        ></div>
        <div className="modal__content">
          <div className="modal__header">
            {avatar && (
              <div className="avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://metadata.ens.domains/mainnet/avatar/${name}`}
                  alt={name}
                  width={70}
                  height={70}
                />
              </div>
            )}
            <div className="header-text">
              <span className="name">{name}</span>
              {address && (
                <span className="address" title={address}>
                  {address.slice(0, 5) + '...' + address.slice(38, 42)}
                </span>
              )}
            </div>
          </div>

          <div className="modal__body">
            {description && (
              <>
                <label>Description:</label>
                <p>{description}</p>
              </>
            )}
            {twitter && (
              <>
                <label>Twitter:</label>
                <p>
                  <a
                    href={`https://twitter.com/${twitter}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{twitter}
                  </a>
                </p>
              </>
            )}
            {telegram && (
              <>
                <label>Telegram:</label>
                <p>
                  <a
                    href={`https://t.me/${telegram}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{telegram}
                  </a>
                </p>
              </>
            )}
            {github && (
              <>
                <label>Github:</label>
                <p>
                  <a
                    href={`https://github.com/${github}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{github}
                  </a>
                </p>
              </>
            )}
            {url && (
              <>
                <label>Website:</label>
                <p>
                  <a href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 100;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal__background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
        }

        .modal__content {
          padding: 1.5rem;
          width: 25rem;
          min-height: 4rem;
          background-color: var(--gray-50);
          z-index: 1000;
          border-radius: 0.5rem;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
        }

        .modal__header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-text {
          display: flex;
          flex-direction: column;
        }

        .avatar {
          background: var(--gray-200);
          margin: 0;
          padding: 0;
          line-height: 0;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .name {
          font-size: 1.75rem;
          line-height: 1;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .address {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-400);
        }

        .modal__body {
          margin-top: 1rem;
        }

        .modal__body label {
          font-weight: 500;
          color: var(--gray-600);
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .modal__body p {
          color: var(--gray-500);
        }
      `}</style>
    </>
  )
}

import Head from 'next/head'
import Link from 'next/link'
import Hero from '../../components/tool-hero'

export default function Eth() {
	return (
		<>
			<Head>
				<h1>Ethereum Tools</h1>
			</Head>

			<Hero name="Ethereum" />

			<main className="container">
        <div className="section">
          <h2 className="section__title">Statistics</h2>
          <div className="grid grid--2">
            <div className="card">
              <span className="card__label">Price (USD)</span>
              <div className="card__content">
                <span className="card__number">
                  $1,241.72
                </span>
              </div>
            </div>
            <div className="card">
              <span className="card__label">Price (USD)</span>
              <div className="card__content">
                <span className="card__number">
                  $1,241.72
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
		</>
	)
}

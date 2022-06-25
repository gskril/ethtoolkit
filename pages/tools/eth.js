import Head from 'next/head'
import Link from 'next/link'
import Hero from '../../components/tool-hero'
import Card from '../../components/card'

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
						<Card
							label="Price (USD)"
							type="number"
							number="$1,241.72"
						/>
						<Card
							label="Price (USD)"
							type="number"
							number="$1,241.72"
						/>
					</div>
				</div>
			</main>
		</>
	)
}

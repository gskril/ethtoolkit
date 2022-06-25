import Head from 'next/head'
import Link from 'next/link'
import useFetch from '../../hooks/fetch'
import Hero from '../../components/tool-hero'
import Card from '../../components/card'

export default function Eth() {
	const gasBest = useFetch('https://gas.best/stats')
	const ethPrice = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(gasBest.data?.ethPrice)

	return (
		<>
			<Head>
				<title>Ethereum Tools</title>
			</Head>

			<Hero name="Ethereum" />

			<main className="container">
				<div className="section">
					<h2 className="section__title">Statistics</h2>
					<div className="grid grid--2">
						<Card
							isLoading={gasBest.isLoading}
							label="Price (USD)"
							type="number"
							number={ethPrice}
						/>
						<Card
							isLoading={gasBest.isLoading}
							label="Gas price (Gwei)"
							type="number"
							number={gasBest.data?.pending?.fee}
						/>
					</div>
				</div>
			</main>
		</>
	)
}

import Head from 'next/head'
import { useState } from 'react'
import useFetch from '../../hooks/fetch'
import Hero from '../../components/tool-hero'
import Card from '../../components/card'

export default function Eth() {
	const gasBest = useFetch('https://gas.best/stats')
	const ethPrice = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(gasBest.data?.ethPrice)

	const [ethConversion, setEthConversion] = useState(null)
	const [weiConversion, setWeiConversion] = useState(null)

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

				<div className="section">
					<h2 className="section__title">Tools</h2>
					<div className="grid">
						<Card label="Ether <> Wei">
							<div className="converter">
								<div>
									<input
										type="number"
										id="ether"
										name="ether"
										step={0.001}
										placeholder="0.75"
										value={ethConversion}
										onChange={(e) => {
											setEthConversion(e.target.value)
											setWeiConversion(
												e.target.value *
													1000000000000000000
											)
										}}
									/>
									<label htmlFor="ether">Ether</label>
								</div>
								<span className="arrow">→</span>
								<div>
									<div>
										<input
											type="number"
											id="wei"
											name="wei"
											step={1000000000000000}
											placeholder="750000000000000000"
											value={weiConversion}
											onChange={(e) => {
												setWeiConversion(e.target.value)
												setEthConversion(
													e.target.value /
														1000000000000000000
												)
											}}
										/>
										<label htmlFor="wei">Wei</label>
									</div>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</main>

			<style jsx>{`
				.converter {
					display: flex;
					gap: 1rem;
					background-color: var(--gray-50);
					max-width: fit-content;
					margin: 0 auto;
					padding: 0.5rem 1rem;
					border-radius: 0.25rem;
				}

				.converter input {
					font-size: 1.125rem;
					font-weight: bold;
					background: transparent;
					width: fit-content;
					outline: none;
					width: fit-content;
				}

				.converter input[name='ether'] {
					width: 4rem;
				}

				.converter input[name='wei'] {
					width: 13rem;
				}

				.converter label {
					font-size: 0.6875rem;
					font-weight: bold;
					color: var(--neutral-400);
				}

				.converter .arrow {
					color: var(--neutral-400);
				}
			`}</style>
		</>
	)
}

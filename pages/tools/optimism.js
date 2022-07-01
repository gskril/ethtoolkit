import Head from 'next/head'
import { useState } from 'react'
import useFetch from '../../hooks/fetch'
import toast, { Toaster } from 'react-hot-toast'
import Hero from '../../components/tool-hero'
import Card from '../../components/card'
import { useContractWrite } from 'wagmi'

export default function Optimism() {
	// Token price
	const opToken = useFetch(
		'https://min-api.cryptocompare.com/data/price?fsym=OP&tsyms=USD'
	)
	const opTokenPrice = opToken?.data?.USD

	// Write to bridge contract
	const [ethToBridge, setEthToBridge] = useState(0)
	const { write: bridge } = useContractWrite({
		addressOrName: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
		contractInterface: [
			'function depositETH(uint32 _l2Gas, bytes calldata _data) external payable',
		],
		functionName: 'depositETH',
		chainId: 1,
		args: [1300000, []],
		overrides: {
			value: (ethToBridge * 1000000000000000000).toString(),
		},
		onError(err) {
			if (
				err.message.includes(
					'insufficient funds for intrinsic transaction cost'
				)
			) {
				toast.error('Insufficient funds')
			} else {
				toast.error(err.message)
			}
		},
	})

	// Check airdrop eligibility
	const [airdropAddress, setAirdropAddress] = useState('')
	async function checkAirdrop() {
		let address

		if (airdropAddress.length < 5) {
			return toast.error('Please enter a name or address')
		}

		const loadingToast = toast.loading('Checking eligibility...')
		if (airdropAddress.length !== 42 && !airdropAddress.startsWith('0x')) {
			address = await fetch(
				`https://api.ensideas.com/ens/resolve/${airdropAddress}`
			)
				.then((res) => res.json())
				.then((data) => data.address)
				.catch(() => null)
		} else {
			address = airdropAddress
		}

		if (!address) {
			toast.dismiss(loadingToast)
			return toast.error(
				`Unable to resolve ${
					airdropAddress.length < 10 ? `'${airdropAddress}'` : 'name'
				}`
			)
		}

		fetch(`https://mainnet-indexer.optimism.io/v1/airdrops/${address}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.totalAmount > 0) {
					toast.success(
						`You are eligible to claim ${parseFloat(
							data.totalAmount / 1000000000000000000
						).toFixed(2)} tokens!`
					)
				} else {
					toast.error(`You are not eligible for the first airdrop`)
				}
			})
			.catch(() => {
				toast.error('Error checking airdrop eligibility')
			})

		toast.dismiss(loadingToast)
	}

	return (
		<>
			<Head>
				<title>Optimism</title>
				<meta property="og:title" content="Optimism" />
			</Head>

			<Hero name="Optimism" />

			<main className="container">
				<div className="section">
					<h2 className="section__title">Statistics</h2>
					<div className="grid grid--3">
						<Card
							isLoading={opToken.isLoading}
							label="$OP Price"
							type="number"
							number={`$${parseFloat(opTokenPrice).toFixed(2)}`}
						/>
						<Card
							isLoading={opToken.isLoading}
							label="Gas Savings vs L1"
							type="number"
							number="80x"
						/>
						<Card
							isLoading={opToken.isLoading}
							label="Transactions / Day"
							type="number"
							number="136,938"
						/>
					</div>
				</div>

				<div className="section">
					<h2 className="section__title">Read</h2>
					<div className="grid">
						<Card label="Airdrop Eligibility">
							<div className="input-group">
								<input
									type="text"
									placeholder="gregskril.eth"
									onChange={(e) => {
										setAirdropAddress(e.target.value)
									}}
								/>
								<button
									onClick={() => {
										checkAirdrop()
									}}
								>
									Check
								</button>
							</div>
						</Card>
					</div>
				</div>

				<div className="section">
					<h2 className="section__title">Write</h2>
					<div className="grid">
						<Card label="Bridge from ETH">
							<div className="input-group">
								<input
									type="number"
									placeholder="0.75"
									style={{ maxWidth: '8rem' }}
									onChange={(e) => {
										setEthToBridge(e.target.value)
									}}
								/>
								<button
									onClick={() => {
										if (!ethToBridge || ethToBridge === 0) {
											return toast.error(
												'Enter a non-zero amount'
											)
										}
										bridge()
									}}
								>
									Transfer
								</button>
							</div>
						</Card>
					</div>
				</div>
			</main>

			<Toaster position="bottom-center" reverseOrder={false} />
		</>
	)
}

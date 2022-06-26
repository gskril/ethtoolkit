import Head from 'next/head'
import { useState } from 'react'
import useFetch from '../../hooks/fetch'
import toast, { Toaster } from 'react-hot-toast'
import Hero from '../../components/tool-hero'
import Card from '../../components/card'
import { useAccount, useBalance, useContractWrite } from 'wagmi'

export default function Optimism() {
	// Token price
	const opToken = useFetch(
		'https://min-api.cryptocompare.com/data/price?fsym=OP&tsyms=USD'
	)
	const opTokenPrice = opToken?.data?.USD

	// Check account balance
	const { data: connectedAccount } = useAccount()
	const { data: balance } = useBalance({
		addressOrName: connectedAccount?.address,
	})
	const balanceETH = balance?.formatted

	// Write to bridge contract
	const [ethToBridge, setEthToBridge] = useState(0)
	const { write: bridge } = useContractWrite(
		{
			addressOrName: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
			contractInterface: [
				'function depositETH(uint32 _l2Gas, bytes calldata _data) external payable',
			],
		},
		'depositETH',
		{ args: [1300000, []] },
		{
			overrides: {
				value: (ethToBridge * 1000000000000000000).toString(),
			},
		}
	)

	// Check airdrop eligibility
	const [airdropAddress, setAirdropAddress] = useState('')
	async function checkAirdrop() {
		let address

		if (airdropAddress.length !== 42 && !airdropAddress.startsWith('0x')) {
			address = await fetch(
				`https://api.ensideas.com/ens/resolve/${airdropAddress}`
			)
				.then((res) => res.json())
				.then((data) => data.address)
				.catch((err) => null)
		} else {
			address = airdropAddress
		}

		if (!address) return toast.error('Unable to resolve ENS name')

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
	}

	return (
		<>
			<Head>
				<title>Optimism</title>
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
							number="81x"
						/>
						<Card
							isLoading={opToken.isLoading}
							label="Transactions / Day"
							type="number"
							number="133,106"
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
										if (!connectedAccount) {
											return toast.error(
												'Connect your wallet'
											)
										} else if (!ethToBridge || ethToBridge === 0) {
											return toast.error(
												'Enter a non-zero amount'
											)
										} else if (balanceETH < ethToBridge) {
											return toast.error(
												"You don't have enough ETH to bridge"
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

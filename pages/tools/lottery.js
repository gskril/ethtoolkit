import Head from 'next/head'
import { useState } from 'react'
import Hero from '../../components/tool-hero'
import toast, { Toaster } from 'react-hot-toast'
import Card from '../../components/card'
import {
	useNetwork,
	useContractWrite,
	useContractReads,
} from 'wagmi'

const contractConfig = {
	addressOrName: '0x8DE42dAE71A75203fBdb9C45eBC0e6E69206c5c5',
	contractInterface: require('../../lib/lottery-abi.json'),
}

export default function Lottery() {
	const { chain: activeChain } = useNetwork()
	const [message, setMessage] = useState(null)
	const [ticketPrice, setTicketPrice] = useState(0)
	const [numberOfTickets, setNumberOfTickets] = useState(0)
	const [numberOfTicketsSold, setNumberOfTicketsSold] = useState(0)
	const [readContractInitialLoading, setReadContractInitialLoading] =
		useState(true)

	// Read current game stats from the contract
	useContractReads({
		contracts: [
			{
				...contractConfig,
				functionName: 'ticketPrice',
				chainId: 4,
			},
			{
				...contractConfig,
				functionName: 'numberOfTickets',
				chainId: 4,
			},
			{
				...contractConfig,
				functionName: 'numberOfTicketsSold',
				chainId: 4,
			},
		],
		watch: true,
		onSuccess(data) {
			setTicketPrice(Number(data[0]))
			setNumberOfTickets(Number(data[1]))
			setNumberOfTicketsSold(Number(data[2]))
			setReadContractInitialLoading(false)
		},
	})

	const [ticketsToBuy, setTicketsToBuy] = useState(0)

	const { write: buyTickets } = useContractWrite({
		...contractConfig,
		functionName: 'buyTicket',
		args: [parseFloat(ticketsToBuy)],
		chainId: 4,
		overrides: {
			value: Number(ticketPrice * ticketsToBuy).toFixed(),
		},
		onError(error) {
			if (
				error.message.includes(
					'insufficient funds for intrinsic transaction cost'
				)
			) {
				toast.error('Insufficient funds')
			} else {
				toast.error(error.message)
			}
		},
		onSuccess(data) {
			console.log(data)
			toast.success("You're transaction has been submitted")
			setMessage(
				<a
					href={`https://rinkeby.etherscan.io/tx/${data.hash}`}
					target="_blank"
					rel="noreferrer"
				>
					View on Etherscan
				</a>
			)
		},
	})

	return (
		<>
			<Head>
				<title>Degen Lottery</title>
				<meta property="og:title" content="Degen Lottery" />
			</Head>

			<Hero
				name="Rinkeby ETH Lottery"
				description="Participate in an on-chain lottery powered by Chainlink VRF."
			/>

			<main className="container">
				<div className="section">
					<h2 className="section__title">Read</h2>
					<div className="grid grid--3">
						<Card
							label="Ticket Price"
							isLoading={readContractInitialLoading}
							type="number"
							number={
								(ticketPrice / 1000000000000000000).toString() +
								' ETH'
							}
						/>
						<Card
							label="Total Tickets"
							isLoading={readContractInitialLoading}
							type="number"
							number={numberOfTickets?.toString()}
						/>
						<Card
							label="Tickets Sold"
							isLoading={readContractInitialLoading}
							type="number"
							number={numberOfTicketsSold?.toString()}
						/>
					</div>
				</div>
				<div className="section">
					<h2 className="section__title">Write</h2>
					<div className="grid">
						<Card label="Buy Tickets">
							<div className="input-group">
								<input
									type="number"
									step={1}
									placeholder="2"
									style={{ maxWidth: '8rem' }}
									onChange={(e) => {
										setTicketsToBuy(e.target.value)
									}}
								/>
								<button
									type="submit"
									onClick={() => {
										if (!ticketsToBuy > 0) {
											toast.error(
												'Enter a number of tickets to buy'
											)
											return
										} else if (activeChain.id !== 4) {
											toast.error(
												'This game is only available on Rinkeby'
											)
										}
										buyTickets()
									}}
								>
									Buy
								</button>
							</div>
						</Card>
					</div>
				</div>
				{message && <p className="text-center">{message}</p>}
			</main>

			<Toaster position="bottom-center" reverseOrder={false} />
		</>
	)
}

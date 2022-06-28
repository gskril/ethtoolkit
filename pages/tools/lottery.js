import Head from 'next/head'
import { useState } from 'react'
import Hero from '../../components/tool-hero'
import toast, { Toaster } from 'react-hot-toast'
import Card from '../../components/card'
import {
	useAccount,
	useBalance,
	useNetwork,
	useContractWrite,
	useContractRead,
} from 'wagmi'

const contractConfig = {
	addressOrName: '0x8DE42dAE71A75203fBdb9C45eBC0e6E69206c5c5',
	contractInterface: require('../../lib/lottery-abi.json'),
}

export default function Lottery() {
	const { data: connectedAccount } = useAccount()
	const { data: balance } = useBalance({
		addressOrName: connectedAccount?.address,
	})
	const { activeChain } = useNetwork()

	const { data: ticketPriceData, isLoading: ticketPriceLoading } =
		useContractRead(contractConfig, 'ticketPrice', {
			chainId: 4,
		})

	const { data: ticketsData, isLoading: ticketsLoading } = useContractRead(
		contractConfig,
		'numberOfTickets',
		{
			chainId: 4,
		}
	)

	const { data: ticketsSoldData, isLoading: ticketsSoldLoading } =
		useContractRead(contractConfig, 'numberOfTicketsSold', {
			chainId: 4,
		})

	const [ticketsToBuy, setTicketsToBuy] = useState(0)

	const { write: buyTickets } = useContractWrite(
		contractConfig,
		'buyTicket',
		{
			args: [parseFloat(ticketsToBuy)],
			overrides: {
				from: connectedAccount?.address,
				value: Number(ticketPriceData * ticketsToBuy).toFixed(),
			},
		}
	)

	return (
		<>
			<Head>
				<title>Degen Lottery</title>
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
							isLoading={ticketPriceLoading}
							type="number"
							number={
								(
									ticketPriceData / 1000000000000000000
								).toString() + ' ETH'
							}
						/>
						<Card
							label="Total Tickets"
							isLoading={ticketsLoading}
							type="number"
							number={ticketsData?.toString()}
						/>
						<Card
							label="Tickets Sold"
							isLoading={ticketsSoldLoading}
							type="number"
							number={ticketsSoldData?.toString()}
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
										if (!connectedAccount) {
											toast.error('Connect your wallet')
											return
										} else if (activeChain.id !== 4) {
											toast.error(
												'This game is only available on Rinkeby'
											)
											return
										} else if (
											balance.formatted <
											ticketsToBuy *
												(ticketPriceData /
													1000000000000000000)
										) {
											toast.error('Insufficient funds')
											return
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
			</main>

			<Toaster position="bottom-center" reverseOrder={false} />
		</>
	)
}

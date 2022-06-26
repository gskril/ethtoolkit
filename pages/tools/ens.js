import Head from 'next/head'
import { useState } from 'react'
import { randomBytes } from 'crypto'
import useFetch from '../../hooks/fetch'
import toast, { Toaster } from 'react-hot-toast'
import Hero from '../../components/tool-hero'
import Card from '../../components/card'
import EnsProfile from '../../components/ens-profile'
import {
	useAccount,
	useBalance,
	useContractRead,
	useContractWrite,
} from 'wagmi'

export default function ENS() {
	const ensStats = useFetch(
		'https://api.opensea.io/api/v1/collection/ens/stats'
	)
	const namesRegistered = new Intl.NumberFormat('en-US').format(
		ensStats?.data?.stats?.count
	)
	const owners = new Intl.NumberFormat('en-US').format(
		ensStats?.data?.stats?.num_owners
	)

	const ensToken = useFetch(
		'https://min-api.cryptocompare.com/data/price?fsym=ENS&tsyms=USD'
	)
	const ensTokenPrice = ensToken?.data?.USD

	const [ensNameToSearch, setEnsNameToSearch] = useState(null)

	const { data: connectedAccount } = useAccount()
	const ensTokenAbi = require('../../lib/ens-token-abi.json')
	const ensRegistryAbi = require('../../lib/ens-registry-abi.json')
	const ensTokenAddress = '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'
	const ensRegistrarAddress = '0x283af0b28c62c092c9727f1ee09c02ca627eb7f5'
	const ensRegistrarConfig = {
		addressOrName: ensRegistrarAddress,
		contractInterface: ensRegistryAbi,
	}
	const ensTokenConfig = {
		addressOrName: ensTokenAddress,
		contractInterface: ensTokenAbi,
	}

	const { data: balance } = useBalance({
		addressOrName: connectedAccount?.address,
		token: ensTokenAddress,
	})

	// Delegate on chain
	const { write: delegateTokens } = useContractWrite(
		ensTokenConfig,
		'delegate',
		{ args: [ensNameToSearch] }
	)

	// Check availability
	const { data: checkAvailability } = useContractRead(
		ensRegistrarConfig,
		'available',
		{ args: [ensNameToSearch?.split('.eth')[0]] }
	)

	const [selectedName, setSelectedName] = useState(null)

	return (
		<>
			<Head>
				<title>Ethereum Name Service</title>
			</Head>

			<Hero
				name="Ethereum Name Service"
				description="See live statistics about ENS and use some of its core functions."
			/>

			<main className="container">
				<div className="section">
					<h2 className="section__title">Analytics</h2>
					<div className="grid grid--3">
						<Card
							isLoading={ensStats.isLoading}
							label=".eth Names Registered"
							type="number"
							number={namesRegistered}
						/>
						<Card
							isLoading={ensStats.isLoading}
							label="Unique Owners"
							type="number"
							number={owners}
						/>
						<Card
							isLoading={ensToken.isLoading}
							label="$ENS Price"
							type="number"
							number={`$${parseFloat(ensTokenPrice).toFixed(2)}`}
						/>
					</div>
				</div>

				<div className="section">
					<h2 className="section__title">Read</h2>
					<div className="grid grid--2">
						<Card label="Name availability">
							<div className="input-group">
								<input
									type="text"
									placeholder="gregskril.eth"
									onChange={(e) => {
										setEnsNameToSearch(e.target.value)
									}}
								/>
								<button
									onClick={() => {
										const isNameAvailable =
											checkAvailability
										if (isNameAvailable) {
											toast.success(
												`${ensNameToSearch} is available`
											)
										} else {
											toast.error(
												`${ensNameToSearch} is not available`
											)
										}
									}}
								>
									Check
								</button>
							</div>
						</Card>
						<Card label="ENS Records">
							<div className="input-group">
								<input
									type="text"
									placeholder="gregskril.eth"
									onChange={(e) => {
										setEnsNameToSearch(e.target.value)
									}}
								/>
								<button
									onClick={() => {
										const name = ensNameToSearch

										if (name?.length < 5) {
											toast.error(
												'Please enter a valid name'
											)
											return
										}

										toast('Loading...')

										fetch(
											`https://ens-records.vercel.app/${name}?avatar`
										)
											.then((res) => res.json())
											.then((data) => {
												if (data.error) {
													toast.error(data.error)
												} else {
													setSelectedName(data)
												}
											})
											.catch((err) => {
												toast.error(err.message)
											})
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
						<Card label="Delegate $ENS">
							<div className="input-group">
								<input
									type="text"
									placeholder="gregskril.eth"
									style={{ maxWidth: '11rem' }}
									onChange={(e) => {
										setEnsNameToSearch(e.target.value)
									}}
								/>
								<button
									onClick={() => {
										if (!connectedAccount) {
											return toast.error(
												'Connect your wallet'
											)
										} else if (
											parseFloat(balance?.formatted) < 1
										) {
											return toast.error(
												'You need at least 1 token to delegate'
											)
										}
										delegateTokens()
									}}
								>
									Delegate
								</button>
							</div>
						</Card>
					</div>
				</div>
			</main>

			{selectedName && (
				<EnsProfile
					records={selectedName}
					setSelectedName={setSelectedName}
				/>
			)}
			<Toaster position="bottom-center" reverseOrder={false} />
		</>
	)
}

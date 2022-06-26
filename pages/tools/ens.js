import Head from 'next/head'
import { useState } from 'react'
import useFetch from '../../hooks/fetch'
import toast, { Toaster } from 'react-hot-toast'
import Hero from '../../components/tool-hero'
import Card from '../../components/card'
import { useAccount, useBalance, useContractWrite } from 'wagmi'

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
	const [ensNameToSearch, setEnsNameToSearch] = useState(null)

	async function checkName(name) {
		if (name.length < 5) {
			toast.error('Please enter a valid name')
			return
		}

		fetch(`https://api.ensideas.com/ens/resolve/${name}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.address) {
					toast.error(`${name} is not available`)
				} else {
					toast.success(`${name} is available`)
				}
			})
			.catch((err) => {
				toast.error('Error checking name availability')
			})
	}

	async function checkRecords(name) {
		if (name.length < 5) {
			toast.error('Please enter a valid name')
			return
		}

		fetch(`https://ens-records.vercel.app/${name}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					toast.error(data.error)
				} else {
					const toatsMsg = ''
					const recordsArray = Object.entries(data).map(
						([key, value]) => ({
							key,
							value,
						})
					)

					recordsArray.map((record) => {
						const recordsToIgnore = ['address', 'avatar']
						if (recordsToIgnore.includes(record.key)) return

						// skip if value is empty
						if (!record.value) return

						toatsMsg += `${record.key}: ${record.value}\n`
					})

					toast(toatsMsg, {
						duration: 6000,
					})
				}
			})
	}

	const { data: connectedAccount } = useAccount()
	const ensTokenAddress = '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'
	const ensContractAbi = ['function delegate(address delegatee)']

	const { data: balance } = useBalance({
		addressOrName: connectedAccount?.address,
		token: ensTokenAddress,
	})

	// Delegate on chain
	const { isError: delegateError, write: delegateTokens } = useContractWrite(
		{
			addressOrName: ensTokenAddress,
			contractInterface: ensContractAbi,
		},
		'delegate',
		{ args: [ensNameToSearch] },
		{
			onError(error) {
				console.log(error)
				toast.error('Error delegating tokens')
			},
		},
		{
			onSuccess(data) {
				console.log(data)
				toast.success('Tokens delegated')
			},
		}
	)

	return (
		<>
			<Head>
				<title>Ethereum Name Service</title>
			</Head>

			<Hero name="Ethereum Name Service" />

			<main className="container">
				<div className="section">
					<h2 className="section__title">Analytics</h2>
					<div className="grid grid--2">
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
										checkName(ensNameToSearch)
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
										checkRecords(ensNameToSearch)
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
					<div className="grid grid--2">
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
											parseFloat(balance.formatted) < 1
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

			<Toaster position="bottom-center" reverseOrder={false} />
		</>
	)
}

import Head from 'next/head'
import { useState } from 'react'
import useFetch from '../../hooks/fetch'
import toast, { Toaster } from 'react-hot-toast'
import Hero from '../../components/tool-hero'
import Card from '../../components/card'
import { useSendTransaction } from 'wagmi'

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
		fetch(`https://api.ensideas.com/ens/resolve/${name}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.address) {
					toast.error(`${name} is not available.`)
				} else {
					toast.success(`${name} is available!`)
				}
			})
	}

	async function checkRecords(name) {
		fetch(`https://ens-records.vercel.app/${name}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					toast.error(`Error fetching records for ${name}.`)
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
			</main>

			<Toaster position="bottom-center" reverseOrder={false} />
		</>
	)
}

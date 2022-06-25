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

	const ensRecordsApi = useFetch(
		`https://ens-records.vercel.app/${ensNameToSearch}`
	)

	if (ensRecordsApi.data && !ensRecordsApi.data.error) {
		const toatsMsg = ''
		const records = ensRecordsApi?.data
		const recordsArray = Object.entries(records).map(([key, value]) => ({
			key,
			value,
		}))

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
						<Card label="ENS Records">
							<div className="input-group">
								<input
									type="text"
									placeholder="gregskril.eth"
									onChange={(e) => {
										setEnsNameToSearch(e.target.value)
									}}
								/>
							</div>
						</Card>
					</div>
				</div>
			</main>

			<Toaster position="bottom-center" reverseOrder={false} />
		</>
	)
}

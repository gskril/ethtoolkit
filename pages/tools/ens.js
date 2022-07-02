import Head from 'next/head'
import { useState, useEffect } from 'react'
import useFetch from '../../hooks/fetch'
import toast, { Toaster } from 'react-hot-toast'
import Hero from '../../components/tool-hero'
import Card from '../../components/card'
import EnsProfile from '../../components/ens-profile'
import {
	useAccount,
	useBalance,
	useNetwork,
	useContractRead,
	useContractWrite,
	useWaitForTransaction,
} from 'wagmi'

export default function ENS() {
	// .eth NFT stats from OpenSea
	const ensStats = useFetch(
		'https://api.opensea.io/api/v1/collection/ens/stats'
	)
	const namesRegistered = new Intl.NumberFormat('en-US').format(
		ensStats?.data?.stats?.count
	)
	const owners = new Intl.NumberFormat('en-US').format(
		ensStats?.data?.stats?.num_owners
	)

	// $ENS stats from CryptoCompare
	const ensToken = useFetch(
		'https://min-api.cryptocompare.com/data/price?fsym=ENS&tsyms=USD'
	)
	const ensTokenPrice = ensToken?.data?.USD

	const [ensNameToSearch, setEnsNameToSearch] = useState(null)
	const [selectedName, setSelectedName] = useState(null)

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

	const { chain } = useNetwork()
	const { address: connectedAccount } = useAccount()
	const { data: balance } = useBalance({
		addressOrName: connectedAccount && connectedAccount,
		token: ensTokenAddress,
		chainId: 1,
	})

	// Delegate on chain
	const { write: delegateTokens } = useContractWrite({
		...ensTokenConfig,
		functionName: 'delegate',
		args: ensNameToSearch,
		chainId: 1,
		onError(error) {
			if (error.message.includes('addr is not configured for ENS')) {
				toast.error('That name does not exist')
			} else {
				toast.error(error.message)
			}
		},
	})

	// Check availability
	const { data: checkAvailability } = useContractRead({
		...ensRegistrarConfig,
		functionName: 'available',
		args: ensNameToSearch ? ensNameToSearch.split('.eth')[0] : ' ',
	})

	// Registration-related variables
	const registrationDuration = 31556952 // 1 year
	const [secret, setSecret] = useState(null)
	const [commitment, setCommitment] = useState(null)
	const [nameToRegister, setNameToRegister] = useState(null)
	const [readyToRegister, setReadyToRegister] = useState(false)

	// Make commit
	const { data: commitNameTxData, write: commitName } = useContractWrite({
		...ensRegistrarConfig,
		functionName: 'commit',
		args: commitment,
		onError(err) {
			toast.error(err.message)
		},
		onSuccess(tx) {
			toast.success('Commitment sent')
		},
		onError(err) {
			toast.error(err.message)
			setSecret(null)
			setCommitment(null)
		},
	})

	useEffect(() => {
		if (commitment) {
			commitName()
		}
	}, [commitName, commitment])

	const { data: commitTxSettled, isLoading: commitTxIsPending } =
		useWaitForTransaction({
			hash: commitNameTxData?.hash,
		})

	// Wait 60 seconds after commit before showing register button
	useEffect(() => {
		if (commitTxSettled) {
			setTimeout(() => {
				setReadyToRegister(true)
			}, 60 * 1000)
		}
	}, [commitTxSettled])

	const { data: priceOfName } = useContractRead({
		...ensRegistrarConfig,
		functionName: readyToRegister && 'rentPrice',
		args: [nameToRegister, registrationDuration],
		watch: true,
	})

	const { data: registerNameData, write: registerName } = useContractWrite({
		...ensRegistrarConfig,
		functionName: 'register',
		args: [nameToRegister, connectedAccount, registrationDuration, secret],
		overrides: {
			value: (Number(priceOfName) + 100000000).toString(), // add 0.1 gwei to avoid pricing bug
			gasLimit: '285000',
		},
		onError(err) {
			toast.error(err.message)
		},
		onSuccess(tx) {
			console.log(tx)
			toast.success('Registration transaction submitted!')
		},
	})

	const { data: nameRegistered, isLoading: nameRegisteredIsPending } =
		useWaitForTransaction({
			hash: registerNameData?.hash,
			onSuccess() {
				toast.success('Name registered!')
			},
		})

	return (
		<>
			<Head>
				<title>Ethereum Name Service</title>
				<meta property="og:title" content="Ethereum Name Service" />
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
										let name = ensNameToSearch

										if (name?.length < 3) {
											return toast.error(
												'Please enter a valid name'
											)
										} else if (!name?.endsWith('.eth')) {
											name += '.eth'
										}

										const ensRecords = fetch(
											`https://ens-records.vercel.app/${name}?avatar`
										)
											.then((res) => res.json())
											.then((data) => {
												if (data.error) {
													throw new Error(data.error)
												} else {
													setSelectedName(data)
												}
											})
											.catch((err) => {
												throw new Error(err)
											})

										toast.promise(ensRecords, {
											loading: 'Getting records...',
											success: 'Records loaded!',
											error: 'Error fetching data',
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
					<div className="grid grid--2">
						<Card label="Register .eth name">
							{nameRegistered ? (
								// Name fully registered
								<>
									<p>You now own {nameToRegister}.eth!</p>
									<a
										href={`https://app.ens.domains/name/${nameToRegister}.eth/details`}
										target="_blank"
										rel="noreferrer"
									>
										Manage your name
									</a>
								</>
							) : registerNameData ? (
								// Name registration transaction is pending
								<>
									<p>You&apos;re transaction is pending</p>
									<a
										href={`https://${
											Number(registerNameData.gasPrice) <
											2000000000
												? 'rinkeby.'
												: '' // if gas is < 2 gwei, its a testnet
										}etherscan.io/tx/${
											registerNameData.hash
										}`}
										target="_blank"
										rel="noreferrer"
									>
										View on Etherscan
									</a>
								</>
							) : commitTxSettled && readyToRegister ? (
								// Register name
								<div className="input-group">
									<button onClick={() => registerName()}>
										Register for 1 Year
									</button>
								</div>
							) : commitTxSettled ? (
								// Waiting 1 minute before we can register
								<>
									<p>
										Wait 1 minute to register your name.
										Stay on this page.
									</p>
									<div className="minute-countdown">
										<div className="minute-countdown__fill" />
									</div>
								</>
							) : commitTxIsPending ? (
								// Submitted to the blockchain
								<>
									<p>You&apos;re transaction is pending</p>
									<a
										href={`https://${
											Number(commitNameTxData?.gasPrice) <
											2000000000
												? 'rinkeby.'
												: '' // if gas is < 2 gwei, its a testnet
										}etherscan.io/tx/${
											commitNameTxData?.hash
										}`}
										target="_blank"
										rel="noreferrer"
									>
										View on Etherscan
									</a>
								</>
							) : (
								// Starting point - make commit tx
								<div className="input-group">
									<input
										type="text"
										placeholder="gregskril.eth"
										style={{ maxWidth: '11rem' }}
										onChange={(e) => {
											setNameToRegister(
												e.target.value?.endsWith('.eth')
													? e.target.value.split(
															'.eth'
													  )[0]
													: e.target.value
											)
										}}
									/>
									<button
										onClick={async (e) => {
											if (
												!nameToRegister ||
												nameToRegister?.length < 3
											) {
												return toast.error(
													'Please enter a valid name'
												)
											}

											const data = await fetch(
												`/api/ens-commit?name=${nameToRegister}&owner=${connectedAccount}&chain=${chain?.id}`
											)
												.then((res) => res.json())
												.catch((err) => {
													return toast.error(
														err.message
													)
												})

											if (data.error) {
												return toast.error(data.error)
											} else {
												setCommitment(data.commitment)
												setSecret(data.secret)
												toast(
													'Warning: this is beta software tested mainly on Rinkeby',
													{
														icon: '🚧',
														style: {
															maxWidth: '100%',
														},
													}
												)
											}
										}}
									>
										Begin
									</button>
								</div>
							)}
						</Card>
						<Card
							label={`Delegate ${
								connectedAccount &&
								Number(balance?.formatted) > 0
									? Number(balance?.formatted)
									: ''
							} $ENS`}
						>
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
										if (
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

			<style jsx>{`
				.minute-countdown {
					width: 100%;
					height: 1rem;
					background-color: var(--blue-200);
					margin-top: 1rem;
					position: relative;
					overflow: hidden;
					border-radius: 0.25rem;
				}

				.minute-countdown__fill {
					background-color: var(--blue-500);
					position: static;
					height: 100%;
					top: 0;
					left: 0;
					width: 10%;
					animation: countdown 60s linear forwards;
				}

				@keyframes countdown {
					from {
						width: 0%;
					}
					to {
						width: 100%;
					}
				}
			`}</style>
		</>
	)
}

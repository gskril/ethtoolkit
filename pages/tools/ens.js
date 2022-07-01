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
	useContractRead,
	useContractWrite,
	useWaitForTransaction,
} from 'wagmi'
import crypto from 'crypto'

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
	const [selectedName, setSelectedName] = useState(null)

	const { address: connectedAccount } = useAccount()
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

	// Make commit
	const [secret, setSecret] = useState(null)
	const [commitment, setCommitment] = useState(null)
	const [nameToRegister, setNameToRegister] = useState(null)
	const [readyToRegister, setReadyToRegister] = useState(false)

	const { data: makeCommitmentData } = useContractRead({
		...ensRegistrarConfig,
		functionName: secret && 'makeCommitment',
		args: [nameToRegister, connectedAccount, secret],
		onSuccess(data) {
			setCommitment(data)
		},
	})

	const { data: commitNameTxData, write: commitName } = useContractWrite({
		...ensRegistrarConfig,
		functionName: 'commit',
		args: makeCommitmentData,
		onError(err) {
			toast.error(err.message)
			console.log({
				name: nameToRegister,
				owner: connectedAccount,
				secret: secret,
			})
		},
		onSuccess(tx) {
			toast.success('Commitment sent')
		},
		onError(err) {
			setSecret(null)
			setCommitment(null)
		},
	})

	useEffect(() => {
		if (commitment) {
			console.log(commitment)
			commitName()
		}
	}, [commitment])

	const { data: commitTxSettled, isLoading: commitTxIsPending } =
		useWaitForTransaction({
			hash: commitNameTxData?.hash,
			onSuccess(data) {
				setTimeout(() => {
					setReadyToRegister(true)
				}, 60 * 1000)
			},
		})

	const { data: registerNameData, write: registerName } = useContractWrite({
		...ensRegistrarConfig,
		functionName: 'register',
		args: [nameToRegister, connectedAccount, '31556952', secret],
		overrides: {
			value: '10000000000000000',
		},
		onError(err) {
			toast.error(err.message)
		},
		onSuccess(tx) {
			console.log(tx)
			toast.success('Registration transaction submitted!')
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
							{registerNameData ? (
								<p>
									<a
										href={`https://${
											Number(registerNameData.gasPrice) <
											2000000000 // if gas is < 2 gwei, its a testnet
												? 'rinkeby.'
												: ''
										}etherscan.io/tx/${
											registerNameData.hash
										}`}
										target="_blank"
										rel="noreferrer"
									>
										View on Etherscan
									</a>
								</p>
							) : commitTxSettled && readyToRegister ? (
								// Register name
								<div className="input-group">
									<button onClick={() => registerName()}>
										Register name
									</button>
								</div>
							) : commitTxSettled ? (
								// Waiting 1 minute before we can register
								<p>
									Waiting 1 minute before we can register the
									name. Stay on this page.
								</p>
							) : commitTxIsPending ? (
								// Submitted to the blockchain
								<p>
									<a
										href={`https://rinkeby.etherscan.io/tx/${commitNameTxData?.hash}`}
										target="_blank"
										rel="noreferrer"
									>
										View on Etherscan
									</a>
								</p>
							) : (
								// Starting point - make commit tx
								<div className="input-group">
									<input
										type="text"
										placeholder="gregskril.eth"
										style={{ maxWidth: '11rem' }}
										onChange={(e) => {
											setEnsNameToSearch(e.target.value)
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

											// Check if name is available
											if (!checkAvailability) {
												return toast.error(
													'That name is not available'
												)
											}

											setSecret(
												'0x' +
													crypto
														.randomBytes(32)
														.toString('hex')
											)
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
		</>
	)
}

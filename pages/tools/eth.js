import Head from 'next/head'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Hero from '../../components/tool-hero'

export default function Eth() {
	return (
		<>
			<Head>
				<title>Ethereum Tools</title>
			</Head>

			<Hero name="Ethereum" />

			<main className="container"></main>
		</>
	)
}

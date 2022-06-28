import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import Head from 'next/head'

const { chains, provider } = configureChains(
	[
		chain.mainnet,
		chain.rinkeby,
	],
	[alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()]
)

const { connectors } = getDefaultWallets({
	appName: 'My RainbowKit App',
	chains,
})

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
})

export default function App({ Component, pageProps }) {
	return (
		<WagmiConfig client={wagmiClient}>
			<RainbowKitProvider chains={chains}>
				<Head>
					<meta property="og:image" content="https://ethnyc22.gregskril.com/sharing.png" />
					<link rel="icon" type="image/png" sizes="128x128" href="/favicon-128.png" />
					<link rel="icon" type="image/png" sizes="64x64" href="/favicon-64.png" />
					<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
					<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
				</Head>
				<Component {...pageProps} />
			</RainbowKitProvider>
		</WagmiConfig>
	)
}

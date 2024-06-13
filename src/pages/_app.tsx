import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { WagmiProvider } from 'wagmi'

import { wagmiConfig } from '@/lib/web3'
import '@/styles/globals.css'

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          <Head>
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/favicon-16.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/favicon-32.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="64x64"
              href="/favicon-64.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="128x128"
              href="/favicon-128.png"
            />
            <meta
              property="og:image"
              content="https://ethtoolkit.xyz/sharing.png"
            />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:creator" content="@gregskril" />
          </Head>

          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

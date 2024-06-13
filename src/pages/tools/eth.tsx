import Head from 'next/head'
import { formatEther } from 'viem'
import { useGasPrice } from 'wagmi'

import Card from '@/components/Card'
import Hero from '@/components/Hero'
import { useEthPrice } from '@/hooks/useEthPrice'

export default function Eth() {
  const ethPrice = useEthPrice()

  const gasPrice = useGasPrice({
    chainId: 1,
    query: { refetchInterval: 12000 },
  })

  return (
    <>
      <Head>
        <title>Ethereum Tools</title>
        <meta property="og:title" content="Ethereum Tools" />
      </Head>

      <Hero name="Ethereum" />

      <main className="container">
        <div className="section">
          <h2 className="section__title">Statistics</h2>
          <div className="grid grid--2">
            <Card
              isLoading={ethPrice.isLoading}
              label="Price (USD)"
              type="number"
              number={ethPrice.data ? `$${ethPrice.data.toFixed(2)}` : 'N/A'}
            />

            <Card
              isLoading={gasPrice.isLoading}
              label="Gas price (Gwei)"
              type="number"
              number={
                gasPrice.data
                  ? Math.floor(Number(formatEther(gasPrice.data, 'gwei')))
                  : 'N/A'
              }
            />
          </div>
        </div>
      </main>
    </>
  )
}

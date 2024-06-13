import Head from 'next/head'
import { formatEther } from 'viem'
import { useGasPrice } from 'wagmi'

import Card from '@/components/Card'
import Hero from '@/components/Hero'
import { useTokenPrice } from '@/hooks/useTokenPrice'

export default function Eth() {
  const ethPrice = useTokenPrice({
    token: '0x0000000000000000000000000000000000000000',
    decimals: 18,
  })

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
              number={
                ethPrice.data
                  ? `$${Number(ethPrice.data.toFixed(2)).toLocaleString()}`
                  : 'N/A'
              }
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

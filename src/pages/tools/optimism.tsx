import Head from 'next/head'

import Card from '@/components/Card'
import Hero from '@/components/Hero'
import { useFetch } from '@/hooks/useFetch'

export default function Optimism() {
  // Token price
  const opToken = useFetch<{ USD: number }>(
    'op-token-price',
    'https://min-api.cryptocompare.com/data/price?fsym=OP&tsyms=USD'
  )

  return (
    <>
      <Head>
        <title>Optimism</title>
        <meta property="og:title" content="Optimism" />
      </Head>

      <Hero name="Optimism" />

      <main className="container">
        <div className="section">
          <h2 className="section__title">Statistics</h2>
          <div className="grid">
            <Card
              isLoading={opToken.isLoading}
              label="$OP Price"
              type="number"
              number={opToken.data ? `$${opToken.data.USD.toFixed(2)}` : 'N/A'}
            />
          </div>
        </div>
      </main>
    </>
  )
}

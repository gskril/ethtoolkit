import Head from 'next/head'
import { useState } from 'react'
import useFetch from '../../hooks/fetch'
import toast, { Toaster } from 'react-hot-toast'
import Hero from '../../components/tool-hero'
import Card from '../../components/card'
import { useContractWrite } from 'wagmi'

export default function Optimism() {
  // Token price
  const opToken = useFetch(
    'https://min-api.cryptocompare.com/data/price?fsym=OP&tsyms=USD'
  )
  const opTokenPrice = opToken?.data?.USD

  // Write to bridge contract
  const [ethToBridge, setEthToBridge] = useState(0)
  const { write: bridge } = useContractWrite({
    addressOrName: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
    contractInterface: [
      'function depositETH(uint32 _l2Gas, bytes calldata _data) external payable',
    ],
    functionName: 'depositETH',
    chainId: 1,
    args: [1300000, []],
    overrides: {
      value: (ethToBridge * 1000000000000000000).toString(),
    },
    onError(err) {
      if (
        err.message.includes(
          'insufficient funds for intrinsic transaction cost'
        )
      ) {
        toast.error('Insufficient funds')
      } else {
        toast.error(err.message)
      }
    },
  })

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
              number={`$${parseFloat(opTokenPrice).toFixed(2)}`}
            />
          </div>
        </div>

        <div className="section">
          <h2 className="section__title">Write</h2>
          <div className="grid">
            <Card label="Bridge from ETH">
              <div className="input-group">
                <input
                  type="number"
                  placeholder="0.75"
                  style={{ maxWidth: '8rem' }}
                  onChange={(e) => {
                    setEthToBridge(e.target.value)
                  }}
                />
                <button
                  onClick={() => {
                    if (!ethToBridge || ethToBridge === 0) {
                      return toast.error('Enter a non-zero amount')
                    }
                    bridge()
                  }}
                >
                  Transfer
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

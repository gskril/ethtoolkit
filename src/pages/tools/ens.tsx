import Head from 'next/head'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { parseAbi } from 'viem'
import {
  getEnsAddress,
  getEnsAvatar,
  getEnsText,
  readContract,
} from 'wagmi/actions'

import Card from '@/components/Card'
import EnsProfile, { EnsRecords } from '@/components/EnsProfile'
import Hero from '@/components/Hero'
import { useFetch } from '@/hooks/useFetch'
import { useTokenPrice } from '@/hooks/useTokenPrice'
import { wagmiConfig } from '@/lib/web3'

import { EnsStatsResponse } from '../api/ens-stats'

export default function ENS() {
  const tokenAddress = '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'
  const registrarController = '0x253553366Da8546fC250F225fe3d25d0C782303b'

  const [ensNameToSearch, setEnsNameToSearch] = useState('')
  const [selectedName, setSelectedName] = useState<EnsRecords | undefined>()

  const tokenPrice = useTokenPrice({
    token: tokenAddress,
    decimals: 18,
  })

  const ensStats = useFetch<EnsStatsResponse>('ens-stats', '/api/ens-stats')

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
              number={
                ensStats.data?.data?.activeNames.toLocaleString() ?? 'N/A'
              }
            />

            <Card
              isLoading={ensStats.isLoading}
              label="Unique Owners"
              type="number"
              number={
                ensStats.data?.data?.participants.toLocaleString() ?? 'N/A'
              }
            />

            <Card
              isLoading={tokenPrice.isLoading}
              label="$ENS Price"
              type="number"
              number={
                tokenPrice.data ? `$${tokenPrice.data.toFixed(2)}` : 'N/A'
              }
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
                  onClick={async () => {
                    const readCall = readContract(wagmiConfig, {
                      chainId: 1,
                      address: registrarController,
                      abi: parseAbi([
                        'function available(string name) view returns (bool)',
                      ]),
                      functionName: 'available',
                      args: [ensNameToSearch.split('.eth')[0]],
                    })

                    await toast.promise(readCall, {
                      loading: 'Loading...',
                      success: (isAvailable) => {
                        if (isAvailable) {
                          return `${ensNameToSearch} is available`
                        } else {
                          throw new Error(`${ensNameToSearch} is not available`)
                        }
                      },
                      error: (err) =>
                        err?.message ?? 'Error checking availability',
                    })
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
                  onClick={async () => {
                    const opts = { name: ensNameToSearch, chainId: 1 } as const

                    const readCalls = Promise.all([
                      getEnsAddress(wagmiConfig, opts),
                      getEnsAvatar(wagmiConfig, opts),
                      getEnsText(wagmiConfig, { ...opts, key: 'description' }),
                      getEnsText(wagmiConfig, { ...opts, key: 'com.github' }),
                      getEnsText(wagmiConfig, { ...opts, key: 'com.twitter' }),
                      getEnsText(wagmiConfig, { ...opts, key: 'url' }),
                    ])

                    await toast.promise(readCalls, {
                      loading: 'Loading...',
                      success: (res) => {
                        const [
                          address,
                          avatar,
                          description,
                          github,
                          twitter,
                          url,
                        ] = res

                        if (!address) throw new Error()

                        setSelectedName({
                          name: ensNameToSearch,
                          address,
                          avatar,
                          description,
                          github,
                          twitter,
                          url,
                        })

                        return 'ENS records loaded'
                      },
                      error: 'No profile found',
                    })
                  }}
                >
                  Check
                </button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {selectedName && (
        <EnsProfile records={selectedName} setSelectedName={setSelectedName} />
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

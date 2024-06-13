import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const { connectors } = getDefaultWallets({
  appName: 'Ethereum Toolkit',
  projectId: 'c5139a945eac06eeb376312caed6bedb',
})

const chains = [mainnet] as const

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(),
  },
  ssr: true,
})

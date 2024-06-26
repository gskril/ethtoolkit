import { Address, parseAbi } from 'viem'
import { useReadContract } from 'wagmi'

type Props = {
  token: Address
  decimals: number
}

export function useTokenPrice({ token, decimals }: Props) {
  const sourceToken = {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    decimals: 6,
  } as const

  const res = useReadContract({
    chainId: 1,
    query: { refetchInterval: 12000 },
    address: '0x07D91f5fb9Bf7798734C3f606dB065549F6893bb', // 1inch Oracle
    abi: parseAbi([
      'function getRate(address srcsourceToken, address dstsourceToken, bool useWrappers) view returns (uint256 weightedRate)',
    ]),
    functionName: 'getRate',
    args: [sourceToken.address, token, false],
  })

  const numerator = 10 ** sourceToken.decimals
  const denominator = 10 ** decimals
  const conversionFactor = numerator / (1e18 * denominator)
  const price = 1 / (Number(res.data) * conversionFactor)

  return { ...res, data: price }
}

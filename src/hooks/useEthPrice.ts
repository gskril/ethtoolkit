import { parseAbi } from 'viem'
import { useReadContract } from 'wagmi'

export function useEthPrice() {
  const sourceToken = {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    decimals: 6,
  } as const

  const destinationToken = {
    address: '0x0000000000000000000000000000000000000000', // ETH
    decimals: 18,
  } as const

  const res = useReadContract({
    chainId: 1,
    query: { refetchInterval: 12000 },
    address: '0x07D91f5fb9Bf7798734C3f606dB065549F6893bb', // 1inch Oracle
    abi: parseAbi([
      'function getRate(address srcsourceToken, address dstsourceToken, bool useWrappers) view returns (uint256 weightedRate)',
    ]),
    functionName: 'getRate',
    args: [sourceToken.address, destinationToken.address, false],
  })

  const numerator = 10 ** sourceToken.decimals
  const denominator = 10 ** destinationToken.decimals
  const conversionFactor = numerator / (1e18 * denominator)
  const price = 1 / (Number(res.data) * conversionFactor)

  return { ...res, data: price }
}

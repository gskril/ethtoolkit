import { Dune } from 'dune-api-client'
import { NextApiRequest, NextApiResponse } from 'next'

const DUNE_API_KEY = process.env.DUNE_API_KEY

export type EnsStatsResponse = {
  data?: {
    activeNames: number
    participants: number
  }
  error?: string
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!DUNE_API_KEY) {
    return res.status(500).json({ error: 'DUNE_API_KEY is not set' })
  }

  const dune = new Dune(DUNE_API_KEY)
  const [activeNames, participants] = await Promise.all([
    dune.results<{ _col0: number }>(5768),
    dune.results<{ _col0: number }>(6491),
  ])

  if (activeNames.error || participants.error) {
    return res.status(500).json({ error: 'Error fetching data' })
  }

  return res.status(200).json({
    data: {
      activeNames: activeNames.data!.result?.rows[0]._col0,
      participants: participants.data!.result?.rows[0]._col0,
    },
  })
}

export default handler

import type { NextApiRequest, NextApiResponse } from 'next'
import { ChargeBee } from 'chargebee-typescript'

const chargebee = new ChargeBee()

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      try {
        const { after, before, offset } = req.body

        const { list, next_offset } = await chargebee.invoice
          .list({
            date: { between: [after, before] },
            recurring: { is: true },
            offset,
            limit: 100,
          })
          .request()

        return res.status(200).json({
          list: list.map(({ invoice }: { invoice: any }) => invoice),
          next_offset,
        })
      } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve invoices' })
      }

    default:
      return res.status(200).json({ message: 'Welcome to API Routes!' })
  }
}

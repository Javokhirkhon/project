import type { NextApiRequest, NextApiResponse } from 'next'
import { ChargeBee, _invoice } from 'chargebee-typescript'
import { Result } from 'chargebee-typescript/lib/result'

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
        const { after, before } = req.body

        const data = []
        const invoicesRequested: Result[] = []

        const getAllInvoices = async (offset: string) => {
          const invoiceResponse = await chargebee.invoice
            .list({
              date: { between: [after, before] },
              recurring: { is: true },
              offset,
              limit: 10,
            })
            .request()

          invoicesRequested.push(...invoiceResponse.list)

          // if (invoiceResponse?.next_offset) {
          //   await getAllInvoices(invoiceResponse?.next_offset)
          // }

          return
        }

        await getAllInvoices('')

        const invoices = invoicesRequested.map((item) => item.invoice)

        for (const invoice of invoices) {
          const customerResponse = await chargebee.customer
            .retrieve(invoice.customer_id)
            .request()
          const customer = customerResponse.customer
          data.push({
            id: invoice.id,
            customer_id: invoice.customer_id,
            date: invoice.date,
            start_date: customer.cf_start_date,
            total: invoice.total ? invoice.total / 100 : 0,
            sales_manager: customer.cf_sales,
            support_manager: customer.cf_support,
            company: customer.company,
          })
        }

        return res.status(200).json(data)
      } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve invoices' })
      }

    default:
      return res.status(200).json({ message: 'Welcome to API Routes!' })
  }
}

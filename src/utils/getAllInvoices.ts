import axios from 'axios'
import { formatDate } from './formatDate'

export const getAllInvoices = async (
  selectedYear: number,
  selectedMonth: number,
  offset: string
) => {
  try {
    const res = await axios.post('/api/invoices', {
      after:
        formatDate(new Date(Date.UTC(selectedYear, selectedMonth - 2, 1))) -
        18000,
      before:
        formatDate(new Date(Date.UTC(selectedYear, selectedMonth, 0))) - 18000,
      offset,
    })

    const invoices = res.data.list

    if (res.data?.next_offset) {
      const recursiveInvoices = await getAllInvoices(
        selectedYear,
        selectedMonth,
        res.data.next_offset
      )
      invoices.push(...recursiveInvoices)
    }

    return invoices
  } catch (err) {
    console.error(err)
    throw err
  }
}

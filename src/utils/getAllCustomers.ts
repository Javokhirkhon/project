import axios from 'axios'

const customers: any[] = []

export const getAllCustomers = async (offset: string) => {
  try {
    const res = await axios.post('/api/customers', { offset })

    customers.push(...res.data.list)

    if (res.data?.next_offset) {
      await getAllCustomers(res.data.next_offset)
    }

    return customers
  } catch (err) {
    console.error(err)
    throw err
  }
}

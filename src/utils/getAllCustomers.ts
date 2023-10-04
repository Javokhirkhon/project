import axios from 'axios'

export const getAllCustomers = async (offset: string) => {
  try {
    const res = await axios.post('/api/customers', { offset })

    const customers = res.data.list

    if (res.data?.next_offset) {
      const recursiveCustomers = await getAllCustomers(res.data.next_offset)
      customers.push(...recursiveCustomers)
    }

    return customers
  } catch (err) {
    console.error(err)
    throw err
  }
}

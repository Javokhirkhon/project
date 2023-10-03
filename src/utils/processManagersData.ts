import { generateBackdatedMonths } from './generateBackdatedMonths'
import { ModifiedAccount } from '@/types'

export const processManagersData = (
  data: any[],
  month: string,
  selectedYear: number,
  selectedMonth: number,
  isAdmin: boolean,
  accounts: ModifiedAccount[]
) => {
  const uniqueSales = data
    .map(({ sales_manager }) => sales_manager)
    .filter((value, index, array) => array.indexOf(value) === index)

  const uniqueSupport = data
    .map(({ support_manager }) => support_manager)
    .filter((value, index, array) => array.indexOf(value) === index)

  const uniqueManagers = isAdmin
    ? [...uniqueSales, ...uniqueSupport]
    : [accounts[0].name]

  const processedData = uniqueManagers.map((manager) => {
    const sortedByManagers = data.filter(
      ({ sales_manager, support_manager }) =>
        sales_manager === manager || support_manager === manager
    )

    const currentAccount = accounts.find(({ name }) => name === manager)

    return {
      manager,
      months: generateBackdatedMonths(
        month,
        sortedByManagers.filter(
          ({ date }: { date: number }) =>
            new Date((date + 18000) * 1000) >=
            new Date(selectedYear, selectedMonth - 1, 1)
        ),
        currentAccount?.bonuses || [],
        selectedYear,
        selectedMonth,
        sortedByManagers
      ),
    }
  })

  return processedData
}

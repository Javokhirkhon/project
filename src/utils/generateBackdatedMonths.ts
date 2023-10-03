import { OmittedBonus } from '@/types'

export const generateBackdatedMonths = (
  date: string,
  array: any[],
  bonuses: OmittedBonus[],
  selectedYear: number,
  selectedMonth: number,
  invoices: any[]
) => {
  const currentDate = new Date(date)
  const months = []
  const currentMonth = new Date(selectedYear, selectedMonth - 1, 1)
  const previousMonth = new Date(selectedYear, selectedMonth - 2, 1)

  const currentExpansion = invoices
    .filter(
      ({ date, start_date }) =>
        new Date((date + 18000) * 1000) >= currentMonth &&
        new Date(start_date) >= previousMonth &&
        new Date(start_date) < currentMonth
    )
    .reduce((acc, cur) => acc + cur.total, 0)

  const previousExpansion = invoices
    .filter(
      ({ date, start_date }) =>
        new Date((date + 18000) * 1000) < currentMonth &&
        new Date((date + 18000) * 1000) >= previousMonth &&
        new Date(start_date) < currentMonth &&
        new Date(start_date) >= previousMonth
    )
    .reduce((acc, cur) => acc + cur.total, 0)

  const expansion = currentExpansion - previousExpansion

  for (let i = 0; i < 12; i++) {
    const month = currentDate.getMonth()
    const year = currentDate.getFullYear()
    const startDate = new Date(year, month, 1)
    const filteredData = array.filter(
      ({ start_date }: { start_date: string }) => {
        const itemDate = new Date(start_date)
        return itemDate >= startDate && itemDate < new Date(year, month + 1, 1)
      }
    )

    const invoices = filteredData.sort(
      (a: { start_date: number }, b: { start_date: number }) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )

    const formattedStartDate = `${startDate.getFullYear()}-${
      startDate.getMonth() + 1
    }`

    const sortedBonus = bonuses?.find(({ date }) => date === formattedStartDate)

    const currentBonus =
      (i < 6 ? sortedBonus?.firstHalf : sortedBonus?.secondHalf) || 0

    months.unshift({
      date: startDate,
      invoices,
      bonus: currentBonus,
      expansion,
      total:
        invoices.reduce(
          (acc, cur) => acc + cur.total,
          i === 0 ? expansion : 0
        ) *
        (currentBonus / 100),
    })
    currentDate.setMonth(month - 1)
  }
  return months
}

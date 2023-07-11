import { OmittedBonus } from '@/types'

export const generateBackdatedMonths = (
  date: string,
  array: any[],
  bonuses: OmittedBonus[]
) => {
  const currentDate = new Date(date)
  const months = []

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
      i < 6 ? sortedBonus?.firstHalf : sortedBonus?.secondHalf

    months.unshift({
      date: startDate,
      invoices,
      bonus: currentBonus || 0,
      getTotal() {
        return (
          (invoices.reduce((acc, cur) => acc + cur.total, 0) * this.bonus) / 100
        )
      },
    })
    currentDate.setMonth(month - 1)
  }
  return months
}

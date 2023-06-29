export const formatMoney = (total: number = 0): string =>
  new Intl.NumberFormat().format(Number(total?.toFixed(2))) + ' sum'

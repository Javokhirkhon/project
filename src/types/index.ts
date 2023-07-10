import { Account, Bonus } from '@prisma/client'

export type OmittedBonus = Omit<Bonus, 'id' | 'accountId'>

export type ModifiedBonus = OmittedBonus & {
  [key: string]: string | number
}

export type ModifiedAccount = Account & { bonuses: OmittedBonus[] }

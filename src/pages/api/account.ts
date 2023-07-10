import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import { Bonus } from '@prisma/client'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      try {
        const { name, company, email, password, createdBy, role } = req.body

        if (createdBy) {
          const isCompanyExists = await prisma.company.findUnique({
            where: { name: company },
          })

          if (isCompanyExists) {
            return res
              .status(409)
              .json({ message: 'Company with the given name already exists' })
          }
        }

        const isAccountExists = await prisma.account.findUnique({
          where: { email: email },
        })

        if (isAccountExists) {
          return res
            .status(409)
            .json({ message: 'Account with the given email already exists' })
        }

        const currentCompany = createdBy
          ? { id: company }
          : await prisma.company.create({
              data: { name: company },
            })

        const hashedPassword = await hash(password, 12)

        const account = await prisma.account.create({
          data: {
            name,
            role,
            email,
            hashedPassword,
            createdBy,
            company: { connect: { id: currentCompany.id } },
          },
        })

        return res.status(201).json(account)
      } catch (error) {
        return res.status(500).json({ message: 'Database error' })
      }
    case 'PUT':
      try {
        const { email, bonuses }: { email: string; bonuses: Bonus[] } = req.body

        await prisma.bonus.deleteMany({
          where: {
            id: {
              in: bonuses.map(({ id }) => id),
            },
          },
        })

        await prisma.account.update({
          where: {
            email,
          },
          data: {
            bonuses: {
              create: bonuses.map(({ date, firstHalf, secondHalf }) => ({
                date,
                firstHalf,
                secondHalf,
              })),
            },
          },
        })

        return res.status(202).json({ message: 'Successfully updated' })
      } catch (error) {
        return res.status(500).json({ message: 'Database error' })
      }
    case 'DELETE':
      try {
        const { email } = req.query

        await prisma.account.delete({
          where: { email: email as string | undefined },
        })

        return res.status(202).json({ message: 'Successfully deleted' })
      } catch (error) {
        return res.status(500).json({ message: 'Database error' })
      }
    default:
      return res.status(200).json({ message: 'Welcome to API Routes!' })
  }
}

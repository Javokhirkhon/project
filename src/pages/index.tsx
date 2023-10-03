import Manager from '@/components/Manager'
import { processManagersData } from '@/utils/processManagersData'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { GetServerSidePropsContext } from 'next'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { authOptions } from './api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import NextLink from 'next/link'
import { ModifiedAccount } from '@/types'
import { Account } from '@prisma/client'
import { getAllCustomers } from '@/utils/getAllCustomers'
import { getAllInvoices } from '@/utils/getAllInvoices'

interface HomePageProps {
  sessionUser: Account
  accounts: ModifiedAccount[]
}

const HomePage = ({ sessionUser, accounts }: HomePageProps) => {
  const isAdmin = sessionUser?.role === 'ADMIN'
  const { push } = useRouter()

  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectMonth = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true)

    const [year, month] = event.target.value.split('-')
    const selectedYear = Number(year)
    const selectedMonth = Number(month)

    const invoices = await getAllInvoices(selectedYear, selectedMonth, '')
    const customers = await getAllCustomers('')

    const optimisedCustomers = new Map(
      customers.map((customer) => [customer.id, customer])
    )

    const processedData = invoices
      .filter((invoice) => optimisedCustomers.has(invoice.customer_id))
      .map((invoice) => {
        const customer = optimisedCustomers.get(invoice.customer_id)
        return {
          id: invoice.id,
          customer_id: invoice.customer_id,
          date: invoice.date,
          start_date: customer?.cf_start_date,
          total: invoice.total ? invoice.total / 100 : 0,
          sales_manager: customer?.cf_sales,
          support_manager: customer?.cf_support,
          company: customer?.company,
        }
      })

    const processedByStartDate = processedData.filter(
      ({ start_date }: { start_date: string }) =>
        new Date(start_date) >= new Date(selectedYear, selectedMonth - 12, 1) &&
        new Date(start_date) < new Date(selectedYear, selectedMonth, 0, 24)
    )

    const processedByManagers = processManagersData(
      processedByStartDate,
      event.target.value,
      selectedYear,
      selectedMonth,
      isAdmin,
      accounts
    )

    setData(processedByManagers)

    setIsLoading(false)
  }

  return (
    <Box px={10}>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        my={2}
        py={2}
        borderBottom='1px solid black'
      >
        <Box>
          <Typography variant='h5' color='primary'>
            Sales Bonus Management
          </Typography>
          {sessionUser.name} | {sessionUser.role}
        </Box>
        <Box display='flex' alignItems='center' gap={2}>
          {isAdmin && (
            <Button href='/settings' LinkComponent={NextLink}>
              Settings
            </Button>
          )}
          <Button
            variant='outlined'
            onClick={async () => {
              await signOut({ redirect: false })
              push('/sign-in')
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='center'
        flexDirection='column'
        gap={2}
        mb={4}
      >
        <Box fontWeight='bold'>Month:</Box>
        <input type='month' onChange={handleSelectMonth} />
      </Box>
      {isLoading ? (
        <Box display='flex' justifyContent='center'>
          <CircularProgress size={100} />
        </Box>
      ) : (
        data?.map((manager, managerIndex) => (
          <Manager key={managerIndex} manager={manager} />
        ))
      )}
    </Box>
  )
}

export default HomePage

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  const sessionUser = await prisma.account.findUnique({
    where: {
      email: session?.user?.email || undefined,
    },
  })

  const accounts = await prisma.account.findMany({
    where: {
      companyId: sessionUser?.companyId,
      ...(sessionUser?.role === 'ADMIN'
        ? { role: 'USER' }
        : { email: sessionUser?.email }),
    },
    select: {
      name: true,
      bonuses: true,
    },
  })

  return {
    props: {
      sessionUser: JSON.parse(JSON.stringify(sessionUser)),
      accounts,
    },
  }
}

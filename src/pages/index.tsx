import Manager from '@/components/Manager'
import { formatDate } from '@/utils/formatDate'
import { processManagersData } from '@/utils/processManagersData'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import axios from 'axios'
import { GetServerSidePropsContext } from 'next'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { authOptions } from './api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { Account } from '@prisma/client'
import NextLink from 'next/link'

interface HomePageProps {
  currentAccount: Account
}

const HomePage = ({ currentAccount }: HomePageProps) => {
  const isAdmin = currentAccount?.role === 'ADMIN'
  const { push } = useRouter()

  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [previousMonth, setPreviousMonth] = useState(new Date())

  const handleSelectMonth = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true)
    const [year, month] = event.target.value.split('-')

    const selectedYear = Number(year)
    const selectedMonth = Number(month)

    setCurrentMonth(new Date(selectedYear, selectedMonth - 1, 1))
    setPreviousMonth(new Date(selectedYear, selectedMonth - 2, 1))

    axios
      .post('/api/chargebee', {
        after:
          formatDate(new Date(Date.UTC(selectedYear, selectedMonth - 2, 1))) -
          18000,
        before:
          formatDate(new Date(Date.UTC(selectedYear, selectedMonth, 0))) -
          18000,
      })
      .then((res) => {
        const processedByStartDate = res.data.filter(
          ({ start_date }: { start_date: string }) =>
            new Date(start_date) >=
              new Date(selectedYear, selectedMonth - 12, 1) &&
            new Date(start_date) < new Date(selectedYear, selectedMonth, 0, 24)
        )

        const processedByManagers = processManagersData(
          processedByStartDate,
          event.target.value,
          selectedYear,
          selectedMonth,
          isAdmin,
          currentAccount.name
        )

        setData(processedByManagers)
      })
      .catch((err) => {
        alert(err?.response?.data?.message)
      })
      .finally(() => setIsLoading(false))
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
          {currentAccount.name} | {currentAccount.role}
        </Box>
        <Box display='flex' alignItems='center' gap={2}>
          {currentAccount.role === 'ADMIN' && (
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
          <Manager
            key={managerIndex}
            {...{
              manager,
              currentMonth,
              previousMonth,
              data,
              setData,
              managerIndex,
            }}
          />
        ))
      )}
    </Box>
  )
}

export default HomePage

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  const currentAccount = session?.user?.email
    ? await prisma.account.findUnique({
        where: {
          email: session.user.email,
        },
      })
    : null

  return {
    props: {
      currentAccount: JSON.parse(JSON.stringify(currentAccount)),
    },
  }
}

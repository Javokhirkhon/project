import prisma from '@/lib/prisma'
import { authOptions } from '../api/auth/[...nextauth]'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { ChangeEvent, useEffect, useState } from 'react'
import { Box, Button, Container, TextField, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ModifiedAccount, ModifiedBonus } from '@/types'

interface AccountPageProps {
  account: ModifiedAccount
}

const AccountPage = ({ account }: AccountPageProps) => {
  const { back, reload } = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [bonuses, setBonuses] = useState<ModifiedBonus[]>([])

  const handleUpdate = async () => {
    setIsLoading(true)

    await axios
      .put('/api/account', { email: account.email, bonuses })
      .then(() => reload())
      .catch((err) => {
        alert(err?.response?.data?.message)
      })
      .finally(() => setIsLoading(false))
  }

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    inputType: string
  ) => {
    const updatedBonuses: ModifiedBonus[] = [...bonuses]
    updatedBonuses[index][inputType] = Math.abs(Number(event.target.value))
    setBonuses(updatedBonuses)
  }

  useEffect(() => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const monthList: ModifiedBonus[] = []

    for (let year = 2022; year <= currentYear; year++) {
      const endMonth = year === currentYear ? currentMonth : 12

      for (let month = 1; month <= endMonth; month++) {
        monthList.push({
          date: `${year}-${month}`,
          firstHalf: 0,
          secondHalf: 0,
        })
      }
    }
    const data = monthList.map(
      (client) =>
        account?.bonuses?.find(({ date }) => date === client?.date) || client
    )

    setBonuses(data)
  }, [account?.bonuses])

  return (
    <Container component='main' maxWidth='sm'>
      <Button variant='outlined' onClick={back} fullWidth sx={{ mt: 3 }}>
        Back
      </Button>
      <Box
        py={3}
        my={3}
        borderTop='1px solid black'
        borderBottom='1px solid black'
      >
        ID: {account.id}
        <br />
        Name: {account.name}
        <br />
        Role: {account.role}
        <br />
        Email: {account.email}
      </Box>
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Box fontWeight='bold'>BONUSES</Box>
        <Button variant='outlined' onClick={handleUpdate} disabled={isLoading}>
          Update
        </Button>
      </Box>
      {bonuses.map((month, index) => (
        <Box key={index} my={1} py={1}>
          <Typography variant='h6' pb={1}>
            {new Date(month.date).toDateString()}
          </Typography>
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            gap={3}
          >
            <TextField
              type='number'
              label='First Half'
              fullWidth
              value={month.firstHalf}
              onChange={(event) => handleInputChange(event, index, 'firstHalf')}
            />
            <TextField
              type='number'
              label='Second Half'
              fullWidth
              value={month.secondHalf}
              onChange={(event) =>
                handleInputChange(event, index, 'secondHalf')
              }
            />
          </Box>
        </Box>
      ))}
    </Container>
  )
}

export default AccountPage

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  const sessionUser = session?.user?.email
    ? await prisma.account.findUnique({
        where: {
          email: session.user.email,
        },
      })
    : null

  if (sessionUser?.role !== 'ADMIN') {
    return { redirect: { destination: '/forbidden' } }
  }

  const account = await prisma.account.findUnique({
    where: {
      id: context?.params?.id as string | undefined,
    },
    include: {
      bonuses: true,
    },
  })

  if (!account) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      sessionUser: JSON.parse(JSON.stringify(sessionUser)),
      account: JSON.parse(JSON.stringify(account)),
    },
  }
}

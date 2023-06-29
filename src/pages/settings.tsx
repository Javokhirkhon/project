import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import NextLink from 'next/link'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next'
import { authOptions } from './api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { Account } from '@prisma/client'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import { signOut } from 'next-auth/react'

interface SettingsPageProps {
  currentAccount: Account
  createdAccounts: Account[]
}

const SettingsPage = ({
  currentAccount,
  createdAccounts,
}: SettingsPageProps) => {
  const { push, replace, asPath } = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)

    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const data = {
      name: form.get('name'),
      role: form.get('role'),
      email: form.get('email'),
      password: form.get('password'),
      company: currentAccount?.companyId,
      createdBy: currentAccount?.id,
    }

    axios
      .post('/api/account', data)
      .then(() => push('/'))
      .catch((err) => {
        alert(err?.response?.data?.message)
      })
      .finally(() => setIsLoading(false))
  }

  const handleDelete = (email: string) => {
    axios
      .delete('/api/account', { params: { email } })
      .then(() => replace(asPath))
      .catch((err) => {
        alert(err?.response?.data?.message)
      })
  }

  return (
    <Container component='main' maxWidth='sm'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <PersonAddAltOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          New Account
        </Typography>
        <Box component='form' onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                id='name'
                name='name'
                label='Name'
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id='role'
                name='role'
                label='Role'
                type='role'
                required
                fullWidth
                value='USER'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id='email'
                name='email'
                label='Email Address'
                type='email'
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id='password'
                name='password'
                label='Password'
                type='password'
                required
                fullWidth
              />
            </Grid>
          </Grid>
          <Button
            type='submit'
            variant='contained'
            size='large'
            fullWidth
            sx={{ my: 3 }}
            disabled={isLoading}
          >
            Add
          </Button>
          <Button
            href='/'
            LinkComponent={NextLink}
            variant='outlined'
            size='large'
            fullWidth
            disabled={isLoading}
            sx={{ mb: 3 }}
          >
            Back
          </Button>
        </Box>
      </Box>
      <hr />
      <Typography component='h1' variant='h5' mt={3}>
        Accounts
      </Typography>
      {!!createdAccounts?.length ? (
        <List>
          {createdAccounts.map(({ id, name, email, role }) => (
            <ListItem
              key={id}
              secondaryAction={
                <IconButton edge='end' onClick={() => handleDelete(email)}>
                  <DeleteOutlinedIcon color='error' />
                </IconButton>
              }
              sx={{ pl: 0 }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AccountCircleOutlinedIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={`${name} - ${role}`} secondary={email} />
            </ListItem>
          ))}
        </List>
      ) : (
        'No Data'
      )}
    </Container>
  )
}

export default SettingsPage

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  const currentAccount = session?.user?.email
    ? await prisma.account.findUnique({
        where: {
          email: session.user.email,
        },
      })
    : null

  if (!currentAccount) {
    return { redirect: { destination: '/sign-in' } }
  }

  if (currentAccount?.role !== 'ADMIN') {
    return { redirect: { destination: '/forbidden' } }
  }

  const createdAccounts = currentAccount
    ? await prisma.account.findMany({
        where: {
          createdBy: currentAccount.id,
        },
      })
    : []

  return {
    props: {
      currentAccount: JSON.parse(JSON.stringify(currentAccount)),
      createdAccounts: JSON.parse(JSON.stringify(createdAccounts)),
    },
  }
}

import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Link,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import NextLink from 'next/link'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]'
import { GetServerSidePropsContext } from 'next'

const SignUpPage = () => {
  const { push } = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)

    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const data = {
      name: form.get('name'),
      company: form.get('company'),
      email: form.get('email'),
      password: form.get('password'),
    }

    await axios
      .post('/api/account', data)
      .then(() => push('/sign-in'))
      .catch((err) => {
        alert(err?.response?.data?.message)
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <Container component='main' maxWidth='sm'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          Sign Up
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
                id='company'
                name='company'
                label='Company'
                required
                fullWidth
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
            Sign Up
          </Button>
          <Grid container justifyContent='flex-end'>
            <Grid item>
              <Link href='/sign-in' component={NextLink}>
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}

export default SignUpPage

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (session) {
    return { redirect: { destination: '/' } }
  }

  return {
    props: {},
  }
}

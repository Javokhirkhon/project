import { Avatar, Box, Button, Typography } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'
import NextLink from 'next/link'

const Forbidden = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Avatar sx={{ bgcolor: 'error.main' }}>
        <ErrorIcon />
      </Avatar>
      <Typography component='h1' variant='h4' my={2}>
        403 - Forbidden
      </Typography>
      <Button href='/' LinkComponent={NextLink} variant='outlined'>
        Go Back To Homepage
      </Button>
    </Box>
  )
}

export default Forbidden

import prisma from '@/lib/prisma'
import { compare } from 'bcryptjs'
import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid Credentials')
        }

        const account = await prisma.account.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!account || !account.hashedPassword) {
          throw new Error('Invalid Credentials')
        }

        const isCorrectPassword = await compare(
          credentials.password,
          account.hashedPassword
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid Credentials')
        }

        return account
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)

import { connectDB } from '@/lib/next-auth/mongodb'
import User from '@/mongo/models/User'
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    // ======================
    // GOOGLE
    // ======================
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ======================
    // CREDENTIALS
    // ======================
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB()

        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await User.findOne({
          email: credentials.email,
          provider: 'credentials',
        }).select('+password +onboardingCompleted')

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image ?? null,
          onboardingCompleted: user.onboardingCompleted,
        }
      },
    }),
  ],

  callbacks: {
    // ======================
    // JWT
    // ======================
    async jwt({ token, account, profile, user }) {
      // -------- GOOGLE LOGIN --------
      if (account?.provider === 'google' && profile) {
        await connectDB()

        let dbUser = await User.findOne({ email: profile.email })

        if (!dbUser) {
          const [firstName, ...lastNameParts] = profile.name?.split(' ') || []

          dbUser = await User.create({
            email: profile.email,
            firstName: firstName || '',
            lastName: lastNameParts.join(' ') || '',
            image: profile.picture,
            provider: 'google',

            onboardingCompleted: false,

            newsletter: true,
            cgvAccepted: true,
            cguAccepted: true,
            termsAcceptedAt: new Date(),
          })
        }

        token.userId = dbUser._id.toString()
        token.email = dbUser.email
        token.firstName = dbUser.firstName
        token.lastName = dbUser.lastName
        token.picture = dbUser.image
        token.onboardingCompleted = dbUser.onboardingCompleted
      }

      // -------- CREDENTIALS LOGIN --------
      if (account?.provider === 'credentials' && user) {
        token.userId = user.id
        token.email = user.email
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.picture = user.image
        token.onboardingCompleted = user.onboardingCompleted
      }

      return token
    },

    // ======================
    // SESSION
    // ======================
    async session({ session, token }) {
      session.user.id = token.userId
      session.user.email = token.email
      session.user.firstName = token.firstName
      session.user.lastName = token.lastName
      session.user.image = token.picture
      session.user.onboardingCompleted = token.onboardingCompleted

      return session
    },

    // ======================
    // REDIRECT (SAFE)
    // ======================
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    },
  },

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/connexion',
  },

  secret: process.env.NEXTAUTH_SECRET,
}

import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  // basePath: '/portal/auth',
  pages: {
    // signIn: '/portal/signin'
  },
  providers: [], // Add providers with an empty array for now
  callbacks: {
    async session({ token, session }) {
      // session.accessToken = token.accessToken
      session.user.accessToken = token.accessToken as string
      // TODO a hack for hydra
      if (!session.user.id) {
        session.user.id = token.email!
      }
      return session
    },
    async jwt({ trigger, account, token }) {
      if (trigger === 'signIn') {
        token.accessToken = account?.access_token
      }
      return token
    }
  }
} satisfies NextAuthConfig

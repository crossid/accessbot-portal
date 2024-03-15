import { type DefaultSession } from 'next-auth'

export type ExtendedUser = DefaultSession['user'] & {
  accessToken: string
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}

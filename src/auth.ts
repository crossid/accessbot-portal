import NextAuth from 'next-auth'
import Hydra from 'next-auth/providers/ory-hydra'
import Auth0, { Auth0Profile } from 'next-auth/providers/auth0'
import { authConfig } from './auth.config'
import { NextRequest } from 'next/server'

const hydra = Hydra({
  clientId: process.env.OAUTH2_CLIENT_ID,
  clientSecret: process.env.OAUTH2_CLIENT_SECRET,
  issuer: process.env.OAUTH2_ISSUER,
  redirectProxyUrl: 'http://acme.local.crossid.io:8006/api/auth',
  authorization: {
    params: {
      scope: 'openid offline',
      audience: process.env.OAUTH2_AUDIENCE,
      state: 'asldfjlsakdjfklsajdfkljasdklfjsakldfj'
    }
  }
})

function createAuth0(organization: string) {
  return Auth0({
    issuer: process.env.OAUTH2_ISSUER,
    clientId: process.env.OAUTH2_CLIENT_ID,
    clientSecret: process.env.OAUTH2_CLIENT_SECRET,
    token: { params: { audience: process.env.OAUTH2_AUDIENCE } },
    authorization: {
      params: {
        //     connection: "google-oauth2",
        organization,
        scope: 'openid profile email offline_access',
        audience: process.env.OAUTH2_AUDIENCE
      }
    }
  })
}

function createProviders(req: NextRequest | undefined) {
  const providerNames = process.env.AUTH_PROVIDERS?.split(',') || []
  const providers = []
  for (const provider of providerNames) {
    if (provider == 'hydra') {
      providers.push(hydra)
    } else if (provider == 'auth0') {
      const workspace_id = req?.headers.get('x-workspace-id') || ''
      providers.push(createAuth0(workspace_id))
    }
  }
  return providers
}

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST }
} = NextAuth((req) => {
  const providers = createProviders(req)
  return {
    ...authConfig,
    providers
  }
})

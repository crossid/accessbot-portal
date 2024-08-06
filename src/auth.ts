import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import { NextRequest } from 'next/server';
import { authConfig } from './auth.config';

function createAuth0() {
  return Auth0({
    issuer: process.env.OAUTH2_ISSUER,
    clientId: process.env.OAUTH2_CLIENT_ID,
    clientSecret: process.env.OAUTH2_CLIENT_SECRET,
    token: { params: { audience: process.env.OAUTH2_AUDIENCE } },
    authorization: {
      params: {
        scope: 'openid profile email offline_access',
        audience: process.env.OAUTH2_AUDIENCE
      }
    }
  });
}

function createProviders(req: NextRequest | undefined) {
  const providerNames = process.env.AUTH_PROVIDERS?.split(',') || ['auth0'];
  const providers = [];

  for (const provider of providerNames) {
    if (provider == 'auth0') {
      const p = createAuth0();
      providers.push(p);
    }
  }

  return providers;
}

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST }
} = NextAuth((req) => {
  const providers = createProviders(req);
  return {
    ...authConfig,
    providers
  };
});

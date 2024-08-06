import { jwtDecode } from 'jwt-decode';
import type { NextAuthConfig } from 'next-auth';
import { core } from './config/core';

export const authConfig = {
  basePath: `${core.basePath}/api/auth`,
  // pages: {
  //   signIn: '/admin/signin'
  // },
  providers: [], // Add providers with an empty array for now
  callbacks: {
    async session({ token, session }) {
      // session.accessToken = token.accessToken
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      // a hack for hydra
      // if (!session.user.id) {
      //   session.user.id = token.email!;
      // }
      if (token.ext?.org_id) {
        session.user.workspaceId = token.ext.org_id;
      }
      return session;
    },
    async jwt({ trigger, account, token }) {
      if (trigger === 'signIn') {
        if (account?.access_token) {
          token.accessToken = account?.access_token;
          // TODO: can't figure out how to access the accessToken.ext so I decode it here
          const decoded = jwtDecode<{
            org_id: string;
            ext: { org_id: string };
          }>(account.access_token);
          let org_id;
          if (decoded.org_id) {
            org_id = decoded.org_id;
          } else if (decoded.ext?.org_id) {
            org_id = decoded.ext.org_id;
          }
          token.ext = { org_id };
        }
      }
      return token;
    }
  },
  session: {
    // set this to the expiration of ID TOKEN EXPIRATION
    maxAge: 36000
  }
} satisfies NextAuthConfig;

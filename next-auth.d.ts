import { type DefaultSession } from 'next-auth';
import 'next-auth/jwt';

export type ExtendedUser = DefaultSession['user'] & {
  workspaceId: string;
};

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: ExtendedUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    ext?: {
      org_id?: string;
    };
  }
}

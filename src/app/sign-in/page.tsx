import { signIn } from '@/auth';
import { LoginButton } from '@/components/login-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicWorkspace } from '@/lib/types';
import {
  getBackendAPIURL,
  getHTTPRequestHost,
  getUIServerAPIURL
} from '@/lib/urls';
import { headers } from 'next/headers';

// TODO maybe this type exist in next-auth
interface ProviderType {
  id: string;
  name: string;
  type: 'oidc';
  signinUrl: string;
  callbackUrl: string;
}

const workspaces: { [key: string]: PublicWorkspace } = {};

async function getWorkspace(): Promise<PublicWorkspace> {
  let host = getHTTPRequestHost();
  if (!host) {
    throw new Error('No host');
  }
  if (workspaces[host]) {
    return Promise.resolve(workspaces[host]);
  }

  const resp = await fetch(`${getBackendAPIURL()}/workspaces/public`, {
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-host': host
    }
  });

  if (resp.status != 200 && resp.status != 404) {
    throw new Error('Failed to fetch workspace');
  }

  if (resp.status == 200) {
    const workspace = await resp.json();
    workspaces[(host = workspace)];
    return workspace;
  } else {
    throw new Error('Failed to fetch workspace');
  }
}

export default async function Page({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const _headers = headers();
  const ws = await getWorkspace();

  // TODO maybe authjs provides a way to get providers in server
  const providers = await fetch(
    `${getUIServerAPIURL(_headers)}/auth/providers`
  ).then((res) => res.json());

  const providerArray: (ProviderType & { provider: string })[] = Object.keys(
    providers
  ).map((provider) => ({
    provider,
    ...providers[provider]
  }));

  async function _signIn(provider: string) {
    'use server';
    const next = searchParams['next'] ? searchParams['next'] : '';
    await signIn(
      provider,
      { redirectTo: `/portal/${next}` },
      {
        organization: ws.external_id
      }
    );
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="relative flex justify-center">
            {ws.logo_url && (
              <div className="logo absolute left-0 mr-auto">
                {/* we don't know the origin of the logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ws.logo_url} alt="Logo" className="size-8" />
              </div>
            )}
            <span>Sign In</span>
          </CardTitle>
          {/* <CardDescription>
            Enter your information to create an account
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 p-8">
            {providerArray.map((p) => (
              <div key={p.id}>
                <LoginButton
                  variant="outline"
                  className="w-full"
                  provider={p.provider}
                  text={
                    p.name === 'Auth0' ? 'Sign in' : `Sign in with ${p.name}`
                  }
                  signIn={_signIn}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Have trouble signing in?{' '}
            <a href="mailto:support@crossid.io">contact support</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

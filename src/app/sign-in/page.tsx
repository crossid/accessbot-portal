import { auth } from '@/auth'
import { LoginButton } from '@/components/login-button'
import { getServerAPIURL } from '@/lib/urls'
import { redirect } from 'next/navigation'

// TODO maybe this type exist in next-auth
interface ProviderType {
  id: string
  name: string
  type: 'oidc'
  signinUrl: string
  callbackURl: string
}
export default async function SignInPage() {
  const session = await auth()
  // redirect to home if user is already logged in
  if (session?.user) {
    redirect('/')
  }

  // TODO maybe authjs provides a way to get providers in server
  const providers = await fetch(`${getServerAPIURL()}/auth/providers`).then(
    (res) => res.json()
  )
  const providerArray: (ProviderType & { provider: string })[] = Object.keys(
    providers
  ).map((provider) => ({
    provider,
    ...providers[provider]
  }))

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
      {providerArray.map((p) => (
        <div key={p.id}>
          <LoginButton provider={p.provider} text={p.name} />
        </div>
      ))}
    </div>
  )
}

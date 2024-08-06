import { auth } from '@/auth';
import { authConfig } from '@/auth.config';
import { SidebarDesktop } from '@/components/sidebar-desktop';
import { SessionProvider } from 'next-auth/react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: ChatLayoutProps) {
  const session = await auth();
  // TODO redirect to the current page after sign in (https://github.com/crossid/accessbot-admin/issues/38)
  // so for now sinc app is small we check on route level so we can redirect with explicit next search param
  // if (!session) {
  //   redirect(`/sign-in?next=/dashboard`);
  // }

  return (
    <SessionProvider session={session} basePath={authConfig.basePath}>
      <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
        <SidebarDesktop />
        <div className="group w-full overflow-auto pl-0 duration-300 ease-in-out animate-in peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}

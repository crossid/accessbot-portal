import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { IconAccessBotChat, IconSeparator } from '@/components/ui/icons';
import { UserMenu } from '@/components/user-menu';
import React from 'react';
// import { ChatHistory } from './chat-history'
// import { SidebarMobile } from './sidebar-mobile'
import { auth } from '@/auth';
import { SidebarToggle } from './sidebar-toggle';

async function UserOrLogin() {
  const session = await auth();

  return (
    <>
      {session?.user ? (
        <>
          {/* <SidebarMobile>
              <ChatHistory userId={session.user.id} />
        </SidebarMobile>*/}
          <SidebarToggle />
        </>
      ) : (
        <Link href="/" target="_blank" rel="nofollow">
          <IconAccessBotChat className="mr-2 size-6 dark:hidden" inverted />
          <IconAccessBotChat className="mr-2 hidden size-6 dark:block" />
        </Link>
      )}
      <div className="flex items-center">
        <IconSeparator className="size-6 text-muted-foreground/50" />
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Button variant="link" asChild className="-ml-2">
            <Link href="/sign-in">Login</Link>
          </Button>
        )}
      </div>
    </>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      <div className="flex items-center justify-end space-x-2">
        {/* example how to add a button to the right */}
        {/* <a
          target="_blank"
          href="https://github.com/crossid/accessbot"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
          <span className="ml-2 hidden md:flex">GitHub</span>
        </a> */}
      </div>
    </header>
  );
}

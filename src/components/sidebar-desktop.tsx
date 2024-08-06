import { auth } from '@/auth';
import { Sidebar } from '@/components/sidebar';
import { ChatHistory } from './chat/chat-history';
import { ThemeToggle } from './theme-toggle';

export async function SidebarDesktop() {
  const session = await auth();

  if (!session) {
    return null;
  }

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-background duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="space-y-2 px-2 py-4 lg:py-8">
              <ChatHistory userId={session?.user.id} />
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

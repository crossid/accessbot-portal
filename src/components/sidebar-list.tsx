import { SidebarItems } from '@/components/sidebar-items';
import { listConversations } from '@/lib/backend';
import { cache } from 'react';

interface SidebarListProps {
  userId?: string;
  children?: React.ReactNode;
}

const loadChats = cache(async (userId: string) => {
  return await listConversations(userId);
});

export async function SidebarList({ userId }: SidebarListProps) {
  const result = await loadChats(userId!);
  // TODO remove once backend supports filtering https://github.com/crossid/accessbot/issues/167
  result.items = result.items.filter((item) => item.status == 'active');

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {result.items?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems chats={result.items} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
    </div>
  );
}

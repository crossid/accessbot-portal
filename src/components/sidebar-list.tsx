import { SidebarItems } from '@/components/sidebar-items';
import { listConversations } from '@/lib/backend';
import { cache } from 'react';

interface SidebarListProps {
  userId?: string;
  userEmail?: string;
  children?: React.ReactNode;
}

const loadChats = cache(async (userId: string, query: string) => {
  return await listConversations(userId, query);
});

export async function SidebarList({ userId, userEmail }: SidebarListProps) {
  // assignee query is here for admin users
  const query = `status eq "active" and assignee eq "${userEmail}"`;
  const result = await loadChats(userId!, query);

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

'use client';

import { AnimatePresence, motion } from 'framer-motion';

// import { SidebarActions } from '@/components/sidebar-actions'
import { Conversation } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SidebarActions } from './sidebar-actions';
import { SidebarItem } from './sidebar-item';

interface SidebarItemsProps {
  chats?: Conversation[];
}

export function SidebarItems({ chats }: SidebarItemsProps) {
  const session = useSession();
  const router = useRouter();
  if (!chats?.length) return null;

  const groupedChats = groupChatsByType(chats);
  const order = ['dataowner', 'recommendation'];

  const archiveChat = async (args: { id: string }) => {
    const resp = await fetch(`/api/conversations/${args.id}/.archive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.data?.accessToken}`
      },
      body: JSON.stringify({ conversation_id: args.id })
    });
    if (!resp.ok) {
      const json = await resp.json();
      return {
        error: json.detail || 'Failed to archive chat.'
      };
    }
    router.refresh();
    router.push('/');
  };

  return (
    <AnimatePresence>
      {order
        .filter((type) => groupedChats[type])
        .map((type) => (
          <div key={type}>
            <h2 className="pb-2 text-sm text-muted-foreground">
              {translateType(type)}
            </h2>
            {groupedChats[type].map((chat, index) => (
              <motion.div
                key={chat?.id}
                exit={{
                  opacity: 0,
                  height: 0
                }}
              >
                <SidebarItem index={index} chat={chat}>
                  <SidebarActions chat={chat} archiveChat={archiveChat} />
                </SidebarItem>
              </motion.div>
            ))}
          </div>
        ))}
    </AnimatePresence>
  );
}

const groupChatsByType = (conversations: Conversation[]) => {
  return conversations.reduce(
    (acc, conversation) => {
      if (!acc[conversation.type]) {
        acc[conversation.type] = [];
      }
      acc[conversation.type].push(conversation);
      return acc;
    },
    {} as { [key: string]: Conversation[] }
  );
};

const translateType = (type: string) => {
  switch (type) {
    case 'recommendation':
      return 'Recommendation';
    case 'dataowner':
      return 'Approvals';
    default:
      return type;
  }
};

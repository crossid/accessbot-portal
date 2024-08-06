'use client';

import { useAIState, useUIState } from 'ai/rsc';
import { Session } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChatList } from './chat-list';
import { ChatPanel } from './chat-panel';
import { EmptyScreen } from './empty-screen';

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[];
  id?: string;
  session?: Session;
}

export function Chat({ id, className, session }: ChatProps) {
  const router = useRouter();
  const path = usePathname();
  const [input, setInput] = useState('');
  const [messages] = useUIState();
  const [aiState] = useAIState();

  useEffect(() => {
    if (!id && aiState.chatId) {
      router.replace(`/converstions/${aiState.chatId}`);
    }
  }, [id, router, aiState.chatId]);

  useEffect(() => {
    const messagesLength = aiState.messages?.length;
    if (messagesLength === 2) {
      router.refresh();
    }
  }, [aiState.messages, router]);

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor();

  return (
    <div className="group w-full overflow-auto pl-0" ref={scrollRef}>
      <div className={cn('pb-[200px] pt-6', className)} ref={messagesRef}>
        {messages.length ? <ChatList messages={messages} /> : <EmptyScreen />}
        <div className="h-px w-full" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  );
}

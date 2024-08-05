'use client';

import { ChatPanel } from '@/components/chat-panel';
import { cn } from '@/lib/utils';
import { Message, useChat } from 'ai/react';
import { usePathname, useRouter } from 'next/navigation';
import { ChatList } from './chat-list';
import { ChatScrollAnchor } from './chat-scroll-anchor';
import { EmptyScreen } from './empty-screen';
import { useToast } from './ui/use-toast';

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[];
  id?: string;
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter();
  const path = usePathname();
  const { toast } = useToast();

  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      api: '/portal/api/chat',
      initialMessages,
      id,
      body: {
        id
      },
      async onResponse(response) {
        if (response.status === 401) {
          toast({
            variant: 'destructive',
            title: 'Authorization error',
            description: response.statusText
          });
        } else if (response.status !== 200) {
          const description = await response.text();
          toast({
            variant: 'destructive',
            title: `Error ${response.statusText}`,
            description
          });
        }
      },
      onFinish() {
        console.log('OnFinish invoked!');
        if (!path.includes('conversations')) {
          router.push(`/conversations/${id}`);
          router.refresh();
        }
      }
    });

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </>
  );
}

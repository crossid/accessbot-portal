// Different types of message bubbles.

import { MemoizedReactMarkdown } from '@/components/markdown';
import { IconAI, IconUser } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
        <IconUser />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {children}
      </div>
    </div>
  );
}

export function BotMessage({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('group relative flex items-start md:-ml-12', className)}>
      <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconAI />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {typeof children === 'string' ? (
          <MemoizedReactMarkdown
            className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words"
            // remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              }
            }}
          >
            {children}
          </MemoizedReactMarkdown>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function ToolMessage({
  children,
  name,
  className
}: {
  children: React.ReactNode;
  name: string;
  className?: string;
}) {
  return (
    <div className={cn('group relative flex items-start md:-ml-12', className)}>
      <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconAI />
      </div>
      <div className="ml-4 flex flex-row items-center gap-2 px-1">
        <Settings className="size-4 text-muted-foreground" />
        <div className="animate-pulse">
          {children}
          <span>...</span>
        </div>
      </div>
    </div>
  );
}

export function ConversationEndedMessage() {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
        <IconAI />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        Conversation has ended,{' '}
        <Link href="/playgrounds/accessbot/bot" className="link">
          please start a new one
        </Link>
        .
      </div>
    </div>
  );
}

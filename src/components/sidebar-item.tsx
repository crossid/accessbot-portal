'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion } from 'framer-motion';

import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { type Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { IconMessageCheck, IconMessageQuestion } from './ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface SidebarItemProps {
  index: number;
  chat: Conversation;
  children: React.ReactNode;
}

export function SidebarItem({ index, chat, children }: SidebarItemProps) {
  const pathname = usePathname();

  const path = `/conversations/${chat.id}`;
  const title = chat.messages?.[0]?.content.substring(0, 100);

  const isActive = pathname === path;
  const [newChatId, setNewChatId] = useLocalStorage('newChatId', null);
  const shouldAnimate = index === 0 && isActive && newChatId;

  if (!chat?.id) return null;

  return (
    <motion.div
      className={cn(
        isActive && 'bg-primary/10',
        'flex h-8 items-center gap-1 font-semibold transition-colors',
        !isActive && 'hover:bg-secondary/80'
      )}
      variants={{
        initial: {
          height: 0,
          opacity: 0
        },
        animate: {
          height: 'auto',
          opacity: 1
        }
      }}
      initial={shouldAnimate ? 'initial' : undefined}
      animate={shouldAnimate ? 'animate' : undefined}
      transition={{
        duration: 0.25,
        ease: 'easeIn'
      }}
    >
      <div className="flex size-6 items-center justify-center">
        {/* {chat.sharePath ? (
          <Tooltip delayDuration={1000}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <IconUsers className="mr-2" />
            </TooltipTrigger>
            <TooltipContent>This is a shared chat.</TooltipContent>
          </Tooltip>
        ) : (
          <IconMessage className="mr-2" />
        )} */}
        <Tooltip delayDuration={500}>
          <TooltipTrigger
            tabIndex={-1}
            className="focus:bg-muted focus:ring-1 focus:ring-ring"
          >
            {chat.type === 'recommendation' ? (
              <IconMessageQuestion className="ml-1" />
            ) : (
              <IconMessageCheck className="ml-1" />
            )}
          </TooltipTrigger>
          <TooltipContent>
            {chat.type === 'recommendation'
              ? 'This is a recommendation for you.'
              : 'This is a request that awaits your approval response.'}
          </TooltipContent>
        </Tooltip>
      </div>
      <Link href={path} className="w-full">
        <div
          className="relative flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={title}
        >
          <span className="whitespace-nowrap">
            {shouldAnimate ? (
              title.split('').map((character, index) => (
                <motion.span
                  key={index}
                  variants={{
                    initial: {
                      opacity: 0,
                      x: -100
                    },
                    animate: {
                      opacity: 1,
                      x: 0
                    }
                  }}
                  initial={shouldAnimate ? 'initial' : undefined}
                  animate={shouldAnimate ? 'animate' : undefined}
                  transition={{
                    duration: 0.25,
                    ease: 'easeIn',
                    delay: index * 0.05,
                    staggerChildren: 0.05
                  }}
                  onAnimationComplete={() => {
                    if (index === title.length - 1) {
                      setNewChatId(null);
                    }
                  }}
                >
                  {character}
                </motion.span>
              ))
            ) : (
              <span>{title}</span>
            )}
          </span>
        </div>
      </Link>
      {isActive && <div className="pr-1">{children}</div>}
    </motion.div>
  );
}

'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { removeConversation } from '@/app/actions'

// import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'
import { Conversation } from '@/lib/types'
import { SidebarActions } from './sidebar-actions'

interface SidebarItemsProps {
  chats?: Conversation[]
}

export function SidebarItems({ chats }: SidebarItemsProps) {
  if (!chats?.length) return null

  return (
    <AnimatePresence>
      {chats.map(
        (chat, index) =>
          chat && (
            <motion.div
              key={chat?.id}
              exit={{
                opacity: 0,
                height: 0
              }}
            >
              <SidebarItem index={index} chat={chat}>
                <SidebarActions chat={chat} removeChat={removeConversation} />
              </SidebarItem>
            </motion.div>
          )
      )}
    </AnimatePresence>
  )
}

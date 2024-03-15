import { listConversations } from '@/app/actions'
import { ThemeToggle } from '@/components/theme-toggle'
import { cache } from 'react'
import { SidebarItems } from './sidebar-items'

interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}

const loadChats = cache(async (userId?: string) => {
  return await listConversations(userId)
})

export async function SidebarList({ userId }: SidebarListProps) {
  const result = await loadChats(userId!)

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
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
      </div>
    </div>
  )
}

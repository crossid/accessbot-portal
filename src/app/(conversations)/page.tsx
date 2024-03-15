import { Chat } from '@/components/chat'
import { generateID } from '@/lib/utils'

export default function IndexPage() {
  const id = generateID()

  return <Chat id={id} />
}

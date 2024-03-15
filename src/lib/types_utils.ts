import { Message } from 'ai'
import { BackendMessage } from './types'

type Role = 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool'

export const mapBackendMessageToClientMessage = (
  msg: BackendMessage
): Message => {
  let role: Role
  switch (msg.type) {
    case 'human':
      role = 'user'
      break
    case 'ai':
      role = 'assistant'
      break
    default:
      throw new Error('Invalid message type')
  }

  return { id: msg.id, role, content: msg.content }
}

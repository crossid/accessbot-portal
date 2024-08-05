import { getConversation } from '@/app/actions'
import { auth } from '@/auth'
import { Conversation } from '@/lib/types'
import { getBackendAPIURL } from '@/lib/urls'
import {
  AIStream,
  AIStreamParser,
  Message,
  OpenAIStreamCallbacks,
  StreamingTextResponse
} from 'ai'

type BackendError = {
  detail: string
}

async function errorFromResponse(response: Response, fallback: string) {
  const j = (await response.json()) as BackendError
  return j.detail || fallback
}

function parseStream(): AIStreamParser {
  return (data) => {
    const json = JSON.parse(data) as {
      // run_id: string
      content: string
      // the graph node that was executed
      name: string
      // additional_kwargs: object
      type: string
      // example: boolean
    }

    console.log('stream: ', json)

    if (json.name !== 'Information' && json.name !== 'DataOwner') {
      return ''
    }

    return json.content
  }
}

export function GenericStream(
  res: Response,
  cb?: OpenAIStreamCallbacks
): ReadableStream {
  return AIStream(res, parseStream(), cb)
}

type Payload = {
  id: string
  messages: Message[]
}

export async function POST(req: Request, context: any) {
  const json = (await req.json()) as Payload
  let { messages, id } = json
  const user = (await auth())?.user
  if (!user?.id) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const lastMessage = messages.pop()!
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.accessToken}`
  }

  let conversation = await getConversation(id, user.id, user.accessToken)
  if (!conversation) {
    // Create conversation
    const resp = await fetch(`${getBackendAPIURL()}/conversations`, {
      cache: 'no-store',
      method: 'POST',
      headers,
      body: JSON.stringify({
        external_id: id
      })
    })

    if (resp.status !== 201) {
      return new Response(
        await errorFromResponse(resp, 'Failed to create conversation'),
        {
          status: resp.status
        }
      )
    }

    conversation = (await resp.json()) as Conversation
  }

  const resp = await fetch(
    `${getBackendAPIURL()}/conversations/${conversation.id}/stream`,
    {
      cache: 'no-store',
      method: 'POST',
      headers,
      body: JSON.stringify({ input: lastMessage.content })
    }
  )
  if (resp.status !== 200) {
    return new Response('Failed to stream conversation', {
      status: resp.status
    })
  }

  const stream = GenericStream(resp, {
    onStart: async () => {
      console.log('Stream started')
    },
    onCompletion: async (completion) => {
      console.log('Completion completed: ', completion)
    },
    onFinal: async (completion) => {
      console.log('Stream completed: ', completion)
    },
    onToken: async (token) => {
      console.log('Token received', token)
    }
  })
  return new StreamingTextResponse(stream)
}

import { auth } from '@/auth';
import { createConversation, getConversation } from '@/lib/backend';
import { StatusError } from '@/lib/types';
import { getBackendAPIURL } from '@/lib/urls';
import {
  createAI,
  createStreamableUI,
  getAIState,
  getMutableAIState
} from 'ai/rsc';
import { Conversation, Message } from '../../lib/types';
import {
  BotMessage,
  ConversationEndedMessage,
  ToolMessage,
  UserMessage
} from './messages';
import { spinner } from './spinner';
import { runAICompletion } from './utils';

async function submitUserMessage(content: string) {
  'use server';

  const session = await auth();
  if (!session?.accessToken) {
    throw new Error('Unauthorized');
  }

  const aiState = getMutableAIState<typeof AI>();
  const chatId = aiState.get().chatId;
  let conv: Conversation | null;
  if (!chatId) {
    conv = await createConversation(
      { external_id: chatId },
      { accessToken: session?.accessToken }
    );
  } else {
    conv = await getConversation(chatId, {
      accessToken: session?.accessToken
    });
  }
  if (!conv) {
    throw new Error('Failed to get / create conversation');
  }

  const reply = createStreamableUI(
    <BotMessage className="items-center">{spinner}</BotMessage>
  );

  const data = { input: content };

  const completion = runAICompletion(
    `${getBackendAPIURL()}/conversations/${conv.id}/stream`,
    // `${getBackendAPIURL()}/conversations/${conv.id}/replay-stream`,
    {
      method: 'POST',
      body: JSON.stringify(data),
      // method: "GET",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`
      }
    }
  );

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(<BotMessage>{content}</BotMessage>);
    if (isFinal) {
      reply.done();
      aiState.done({
        ...aiState.get(),
        chatId: conv?.id,
        messages: [
          ...aiState.get().messages,
          {
            id: conv.id,
            role: 'assistant',
            content
          }
        ]
      });
    }
  });

  completion.onError((error: Error) => {
    if (error instanceof StatusError) {
      if (error.status === 412) {
        reply.update(
          <>
            <ConversationEndedMessage />
          </>
        );
      }
    } else {
      reply.update(<BotMessage>{error.message}</BotMessage>);
    }
    reply.done();
  });

  completion.onFuncCall((name, mode, content: any) => {
    switch (name) {
      case 'find_app': {
        if (mode === 'inputs') {
          // { inputs: { workspace_id: 'tbYMg7N5mF', app_name: 'jira' } }
          reply.update(<ToolMessage name={name}>Determining App</ToolMessage>);
        } else if (mode === 'outputs') {
          // outputs: { app_name: 'projects', app_id: '4dqoFdLL3s', extra_instructions: '...'}
          reply.update(
            <ToolMessage name={name}>
              Found App {content.outputs.app_name}
            </ToolMessage>
          );
        }
        break;
      }
      case 'recommend_access': {
        if (mode === 'inputs') {
          reply.update(
            <ToolMessage name={name}>Recommending access</ToolMessage>
          );
        } else if (mode === 'outputs') {
          // content.outputs
        }
        break;
      }
      // This tool fetches relevant data from the such user (from directory) and access details (from app).
      case 'get_relevant_data': {
        if (mode === 'inputs') {
          reply.update(
            <ToolMessage name={name}>Getting relevant data</ToolMessage>
          );
        } else if (mode === 'outputs') {
          // content.outputs
        }
        break;
      }
      case 'request_access': {
        if (mode === 'inputs') {
          reply.update(
            <ToolMessage name={name}>Requesting access</ToolMessage>
          );
        } else if (mode === 'outputs') {
          // content.outputs
        }
        break;
      }
      default:
        console.debug(`Unknown function: ${name}`);
    }
  });

  return {
    id: Date.now(),
    display: reply.value
  };
}

// The AI state is shared globally between all useAIState hooks under the same <AI/> provider
export type AIState = {
  chatId?: string;
  messages: Message[];
};

// The state is client-side and can contain functions, React nodes, and other data.
// UIState is the visual representation of the AI state.
export type UIState = {
  id: string;
  display: React.ReactNode;
}[];

const initialUIState: UIState = [];
// const initialAIState: AIState = { chatId: nanoid(), messages: [] };
const initialAIState: AIState = { messages: [] };

/**
 * Creates a client-server context provider that can be used to wrap parts of application
 * tree to easily manage both UI and AI states of your application.
 */
export const AI = createAI({
  // Server Actions accessible from the client.
  // It is required to access these server actions via this hook because they are patched when passed through the context
  actions: {
    submitUserMessage
  },
  initialUIState,
  initialAIState,
  onGetUIState: async () => {
    'use server';

    const session = await auth();

    if (session && session.user) {
      const aiState = getAIState<typeof AI>();

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState);
        return uiState;
      }
    } else {
      return;
    }
  }
});

export const getUIStateFromAIState = (aiState: AIState) => {
  return (
    aiState.messages
      // .filter((message) => message.role !== 'system')
      .map((message, index) => ({
        id: `${aiState.chatId}-${index}`,
        display:
          message.role === 'user' ? (
            <UserMessage>{message.content as string}</UserMessage>
          ) : message.role === 'assistant' &&
            typeof message.content === 'string' ? (
            <BotMessage>{message.content}</BotMessage>
          ) : null
      }))
  );
};

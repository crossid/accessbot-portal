import { auth } from '@/auth';
import { AI } from '@/components/chat/actions';
import { Chat } from '@/components/chat/chat';
import { getConversation } from '@/lib/backend';
import { BackendMessage, Message } from '@/lib/types';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export interface ChatPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth();

  if (!session || !session.accessToken) {
    return {};
  }

  const chat = await getConversation(params.id, {
    accessToken: session.accessToken
  });

  return {
    // title: chat?.title.toString().slice(0, 50) ?? 'Chat'
    title: `Conversation ${chat?.id}`
  };
}

export default async function Page({ params }: ChatPageProps) {
  const session = await auth();

  if (!session || !session.accessToken) {
    redirect(`/sign-in?next=/conversations/${params.id}`);
  }

  const conversation = await getConversation(params.id, {
    accessToken: session.accessToken
  });

  if (!conversation) {
    notFound();
  }

  const messages = conversation.messages.map((c) =>
    convertBackendMessageToMessage(c)
  );
  return (
    <AI
      initialAIState={{
        chatId: conversation.id,
        messages
      }}
    >
      <Chat id={conversation.id} session={session} />
    </AI>
  );
}

function convertBackendMessageToMessage(msg: BackendMessage): Message {
  return {
    id: msg.id,
    role: msg.type === 'human' ? 'user' : 'assistant',
    content: msg.content
  };
}

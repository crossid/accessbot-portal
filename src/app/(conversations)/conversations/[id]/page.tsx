import { notFound, redirect } from 'next/navigation';

// import { getChat } from '@/app/actions'
// import { auth } from '@/auth'
import { getConversation } from '@/app/actions';
import { auth } from '@/auth';
import { Chat } from '@/components/chat';
import { mapBackendMessageToClientMessage } from '@/lib/types_utils';
import { Metadata } from 'next';

export interface ChatPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth();

  //   if (!session?.user?.id) {
  //     return {}
  //   }

  //   const conversation = await getConversation(params.id, session.user.id)
  //   // return {
  //   //   title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  //   // }
  return {};
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/sign-in?next=/conversation/${params.id}`);
  }

  const conversation = await getConversation(
    params.id,
    session.user.id,
    session.user.accessToken
  );

  if (!conversation) {
    notFound();
  }

  return (
    <Chat
      id={conversation.external_id}
      initialMessages={conversation.messages.map((m) =>
        mapBackendMessageToClientMessage(m)
      )}
    />
  );
}

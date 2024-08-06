import { auth } from '@/auth';
import { AI } from '@/components/chat/actions';
import { Chat } from '@/components/chat/chat';
import { redirect } from 'next/navigation';

export default async function IndexPage() {
  const session = await auth();
  if (!session) {
    redirect('/sign-in?next=/');
  }

  return (
    <AI initialAIState={{ messages: [] }}>
      <Chat session={session || undefined} />
    </AI>
  );
}

'use server';

import { auth } from '@/auth';
import { Conversation, ListModels } from '@/lib/types';
import { getBackendAPIURL } from '@/lib/urls';

export async function getConversation(
  id: string,
  userId: string,
  accessToken: string
): Promise<Conversation | null> {
  const resp = fetcher<Conversation | null>(
    `/conversations/${id}?id_type=external&links=messages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  return resp;
}

export async function listConversations(
  userId: string,
  limit: number = 1000,
  offset: number = 0
) {
  const session = await auth();
  const resp = fetcher<ListModels<Conversation>>(
    `/conversations?links=messages`,
    {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`
      }
    }
  );

  return resp;
}

export async function removeConversation() {}

export async function fetcher<JSON = any>(
  info: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(`${getBackendAPIURL()}${info}`, init);

  if (!res.ok) {
    if (res.status === 404) {
      return Promise.resolve(null);
    }
    const json = await res.json();
    if (json.detail) {
      const error = new Error(json.detail) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }

  return res.json();
}

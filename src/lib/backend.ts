import { auth } from '@/auth';
import { getBackendAPIURL } from '@/lib/urls';
import { ZodObject } from 'zod';
import { Conversation, ListModels, StatusError } from './types';

export interface ListParams {
  offset?: number;
  limit?: number;
  q?: string;
  labels?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  projection?: string[];
  [key: string]: any;
}

interface FetchResponse<T> {
  items: T;
  total: number;
}

export async function listFetcher<T>(
  endpoint: string,
  params: ListParams = {},
  init?: RequestInit
): Promise<FetchResponse<T>> {
  const session = await auth();
  // Construct the query parameters from the FetchParams
  const queryParams = new URLSearchParams();

  if (params.offset !== undefined)
    queryParams.append('offset', params.offset.toString());
  if (params.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params.q !== undefined) queryParams.append('q', params.q);
  if (params.labels !== undefined)
    queryParams.append('labels', params.labels.join(','));
  if (params.sortBy !== undefined) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder !== undefined)
    queryParams.append('sortOrder', params.sortOrder);
  if (params.projection !== undefined)
    params.projection.forEach((p) => queryParams.append('projection', p));

  // add any other params
  Object.keys(params).forEach((key) => {
    if (
      key !== 'offset' &&
      key !== 'limit' &&
      key !== 'q' &&
      key !== 'labels' &&
      key !== 'sortBy' &&
      key !== 'sortOrder' &&
      key !== 'projection'
    ) {
      queryParams.append(key, params[key]);
    }
  });

  // Construct the full URL with query parameters
  const url = `${endpoint}?${queryParams.toString()}`;

  // Fetch data using the fetcher function
  const response = await fetcher<FetchResponse<T>>(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.accessToken}`
    }
  });

  return response;
}

export async function fetcher<JSON = any>(
  info: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(`${getBackendAPIURL()}${info}`, init);

  if (!res.ok) {
    if (res.status === 404) {
      return Promise.reject(new StatusError(404));
    }
    const json = await res.json();
    if (json.detail) {
      console.error('backend error', json);
      const error = new StatusError(res.status, json, json.detail);
      throw error;
    } else {
      throw new StatusError(res.status);
    }
  }

  if (res.status === 204) {
    return null as JSON;
  }

  return res.json();
}

export async function postFetcher<JSON = any>(
  info: RequestInfo,
  body: any,
  init?: RequestInit
): Promise<JSON> {
  const session = await auth();
  return fetcher(info, {
    ...init,
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.accessToken}`
    }
  });
}

export async function getFetcher<JSON = any>(
  info: RequestInfo,
  init?: RequestInit
): Promise<JSON | null> {
  const session = await auth();

  try {
    const result = await fetcher<JSON>(info, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`
      }
    });
    return result;
  } catch (e: unknown) {
    if (e instanceof StatusError && e.status === 404) {
      return null;
    }
    throw e;
  }
}

export async function patchFetcher<JSON = any>(
  info: RequestInfo,
  body: any,
  init?: RequestInit
): Promise<JSON> {
  const session = await auth();
  return fetcher(info, {
    ...init,
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.accessToken}`
    }
  });
}

export async function putFetcher<JSON = any>(
  info: RequestInfo,
  body: any,
  init?: RequestInit
): Promise<JSON> {
  const session = await auth();
  return fetcher(info, {
    ...init,
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.accessToken}`
    }
  });
}

export async function deleteFetcher(
  info: RequestInfo,
  init?: RequestInit
): Promise<undefined> {
  const session = await auth();
  return fetcher(info, {
    ...init,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.accessToken}`
    }
  });
}

export function converBackendError<T extends ZodObject<any>>(
  backendError: StatusError,
  schema: T
): { fieldErrors?: Record<keyof T['shape'], string[]>; formErrors?: string[] } {
  const fieldErrors: Record<string, string[]> = {};

  if (typeof backendError.error?.detail === 'string') {
    return { formErrors: [backendError.error?.detail] };
  }

  backendError.error?.detail.forEach((error) => {
    // Assuming 'body' is the first element and skipping it
    const fieldName = error.loc[1]; // Accessing the second element as the field name
    const errorMessage = error.msg;

    // Check if the field already has an entry in the result, if not initialize it
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = [];
    }

    // Add the error message to the field's errors array
    fieldErrors[fieldName].push(errorMessage);
  });

  return { fieldErrors: fieldErrors as Record<keyof T['shape'], string[]> };
}

// apis
//
export async function getConversation(
  id: string,
  config: { accessToken: string }
): Promise<Conversation | null> {
  try {
    const resp = await fetcher<Conversation | null>(
      `/conversations/${id}?id_type=internal&links=messages`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.accessToken}`
        }
      }
    );
    return resp;
  } catch (error) {
    if (error instanceof StatusError) {
      if (error.status === 404) {
        return null;
      }
    }

    throw error;
  }
}

export async function createConversation(
  conversation: Partial<Conversation>,
  config: { accessToken: string }
) {
  const resp = fetcher<Conversation>('/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.accessToken}`
    },
    body: JSON.stringify(conversation)
  });

  return resp;
}

export async function listConversations(
  userId: string,
  limit: number = 1000,
  offset: number = 0,
  archived: boolean = false
) {
  const session = await auth();
  const resp = fetcher<ListModels<Conversation>>(
    `/conversations?links=messages`,
    {
      next: { tags: ['conversations'] },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`
      }
    }
  );

  return resp;
}

export async function removeConversation() {}

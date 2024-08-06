import { CoreMessage } from 'ai';
import { z } from 'zod';

export interface ListModels<T> {
  items: T[];
  total: number;
}

export const publicWorkspaceSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  unique_name: z.string(),
  display_name: z.string(),
  logo_url: z.string().url().optional()
});

export type PublicWorkspace = z.infer<typeof publicWorkspaceSchema>;

export type Message = CoreMessage & {
  id: string;
};

export type ConversationStatus =
  | 'active'
  | 'cancelled'
  | 'approved'
  | 'completed';

export type ConversationType = 'recommendation' | 'dataowner';

export interface Conversation {
  id: string;
  workspace_id: string;
  status: ConversationStatus;
  type: ConversationType;
  external_id: string;
  context: Record<string, any>;
  messages: BackendMessage[];
  created_by: string;
  created_at: Date;
}

export type MessageType = 'human' | 'ai';

export interface BackendMessage {
  id: string;
  workspace_id: string;
  conversation_id: string;
  type: MessageType;
  content: string;
  created_at: Date;
}

export type BackendError = {
  detail: Array<{
    type: string;
    loc: Array<string>;
    msg: string;
  }>;
};

export class StatusError extends Error {
  status: number;
  error?: BackendError;

  constructor(status: number, error?: BackendError, message?: string) {
    super(message);
    this.status = status;
    this.error = error;
  }
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string;
    }
>;

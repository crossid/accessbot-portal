export type MessageType = 'human' | 'ai';

export interface BackendMessage {
  id: string;
  workspace_id: string;
  conversation_id: string;
  type: MessageType;
  content: string;
  created_at: Date;
}

export type ConversationStatus = 'active';

export interface Conversation {
  id: string;
  workspace_id: string;
  created_by: string;
  status: ConversationStatus;
  external_id: string;
  context: Record<string, any>;
  created_at: Date;
  messages: BackendMessage[];
}

export interface ListModels<T> {
  items: T[];
  total: number;
}

export interface Workspace {
  id: string;
  external_id: string;
  display_name: string;
  logo_url: string;
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string;
    }
>;

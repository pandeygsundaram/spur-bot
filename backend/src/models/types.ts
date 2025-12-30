export interface Conversation {
  id: string;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  created_at: Date;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

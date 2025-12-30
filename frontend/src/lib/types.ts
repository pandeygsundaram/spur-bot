export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface ConversationHistory {
  conversation: {
    id: string;
    created_at: string;
    updated_at: string;
  };
  messages: Message[];
}

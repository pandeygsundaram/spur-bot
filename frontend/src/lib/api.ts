import type { ChatRequest, ChatResponse, ConversationHistory } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.error || 'Failed to send message');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      0,
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }
}

export async function getConversationHistory(sessionId: string): Promise<ConversationHistory> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.error || 'Failed to load conversation');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(0, 'Unable to load conversation history');
  }
}

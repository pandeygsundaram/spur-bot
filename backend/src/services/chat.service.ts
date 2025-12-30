import databaseService from './database.service';
import llmService from './llm.service';
import { ChatRequest, ChatResponse } from '../models/types';

export class ChatService {
  /**
   * Process a chat message and generate a response
   */
  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    const { message, sessionId } = request;

    // Get or create conversation
    let conversationId: string;

    if (sessionId) {
      // Verify conversation exists
      const conversation = await databaseService.getConversation(sessionId);
      if (!conversation) {
        throw new Error('Invalid session ID');
      }
      conversationId = sessionId;
    } else {
      // Create new conversation
      const conversation = await databaseService.createConversation();
      conversationId = conversation.id;
    }

    // Save user message to database
    await databaseService.createMessage(conversationId, 'user', message);

    // Get conversation history for context
    const conversationHistory = await databaseService.getRecentMessages(conversationId, 10);

    // Generate AI response
    const aiReply = await llmService.generateReply(conversationHistory, message);

    // Save AI response to database
    await databaseService.createMessage(conversationId, 'ai', aiReply);

    return {
      reply: aiReply,
      sessionId: conversationId,
    };
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(sessionId: string) {
    // Verify conversation exists
    const conversation = await databaseService.getConversation(sessionId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get all messages
    const messages = await databaseService.getMessages(sessionId);

    return {
      conversation,
      messages,
    };
  }
}

export default new ChatService();

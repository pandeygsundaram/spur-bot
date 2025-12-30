import pool from '../config/database';
import { Conversation, Message } from '../models/types';

export class DatabaseService {
  /**
   * Create a new conversation
   */
  async createConversation(): Promise<Conversation> {
    const result = await pool.query<Conversation>(
      'INSERT INTO conversations DEFAULT VALUES RETURNING *'
    );
    return result.rows[0];
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    const result = await pool.query<Conversation>(
      'SELECT * FROM conversations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new message
   */
  async createMessage(
    conversationId: string,
    sender: 'user' | 'ai',
    text: string
  ): Promise<Message> {
    const result = await pool.query<Message>(
      `INSERT INTO messages (conversation_id, sender, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [conversationId, sender, text]
    );
    return result.rows[0];
  }

  /**
   * Get all messages for a conversation, ordered by creation time
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const result = await pool.query<Message>(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );
    return result.rows;
  }

  /**
   * Get recent messages for context (last N messages)
   */
  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    const result = await pool.query<Message>(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [conversationId, limit]
    );
    return result.rows.reverse(); // Reverse to get chronological order
  }
}

export default new DatabaseService();

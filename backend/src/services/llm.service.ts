import OpenAI from 'openai';
import { Message } from '../models/types';

const FAQ_KNOWLEDGE = `
# Store Information

## Shipping Policy
- We offer FREE shipping on orders over $50 within the United States
- Standard shipping (5-7 business days): $5.99
- Express shipping (2-3 business days): $14.99
- International shipping available to select countries (10-15 business days): $25
- Orders are processed within 1-2 business days
- You will receive a tracking number once your order ships

## Return & Refund Policy
- 30-day money-back guarantee on all products
- Items must be unused and in original packaging
- Return shipping is FREE for defective items
- For other returns, customer pays return shipping ($7.99 flat rate)
- Refunds processed within 5-7 business days after we receive the return
- To initiate a return, email support@spurstore.com with your order number

## Support Hours
- Monday - Friday: 9:00 AM - 6:00 PM EST
- Saturday: 10:00 AM - 4:00 PM EST
- Sunday: Closed
- Email support available 24/7 at support@spurstore.com
- Average response time: 2-4 hours during business hours

## Payment Methods
- We accept Visa, Mastercard, American Express, Discover
- PayPal and Apple Pay also accepted
- All transactions are secure and encrypted
- We do not store credit card information

## About Us
- We are a small e-commerce store specializing in quality products
- Family-owned business operating since 2020
- Based in Austin, Texas
- Committed to excellent customer service and quality products
`;

export class LLMService {
  private openai: OpenAI;
  private readonly maxTokens = 500;
  private readonly model = 'gpt-3.5-turbo';

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate a reply using OpenAI GPT
   */
  async generateReply(conversationHistory: Message[], userMessage: string): Promise<string> {
    try {
      // Build messages array for OpenAI
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are a helpful and friendly customer support agent for Spur Store, a small e-commerce business.

Your responsibilities:
- Answer customer questions clearly and concisely
- Be polite, professional, and empathetic
- Use the store information below to answer questions accurately
- If you don't know something, be honest and offer to help them contact human support
- Keep responses brief but helpful (2-3 sentences usually)
- Don't make up information not provided below

${FAQ_KNOWLEDGE}

Remember: You represent Spur Store. Be helpful, accurate, and friendly!`,
        },
      ];

      // Add conversation history (limit to last 10 messages for context)
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage,
      });

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
        // Add timeout via fetch options if needed
      });

      const reply = completion.choices[0]?.message?.content;

      if (!reply) {
        throw new Error('No response generated from OpenAI');
      }

      return reply.trim();
    } catch (error) {
      // Handle different types of errors
      if (error instanceof OpenAI.APIError) {
        if (error.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your configuration.');
        } else if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.status === 500 || error.status === 503) {
          throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`OpenAI API error: ${error.message}`);
        }
      }

      // Network or timeout errors
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      }

      // Generic error
      throw new Error('Failed to generate response. Please try again later.');
    }
  }

  /**
   * Health check for OpenAI connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new LLMService();

import { Router, Request, Response } from 'express';
import chatService from '../services/chat.service';
import { validateChatMessage, validateSessionId } from '../middleware/validation';
import { chatRateLimiter, strictChatRateLimiter } from '../middleware/rateLimiter';
import { ChatRequest } from '../models/types';

const router = Router();

/**
 * POST /chat/message
 * Send a message and get AI response
 * Rate limited: 10 requests per minute, 50 per hour
 */
router.post(
  '/message',
  chatRateLimiter,
  strictChatRateLimiter,
  validateChatMessage,
  async (req: Request, res: Response, next) => {
    try {
      const request: ChatRequest = req.body;
      const response = await chatService.processMessage(request);

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /chat/history/:sessionId
 * Get conversation history
 */
router.get('/history/:sessionId', validateSessionId, async (req: Request, res: Response, next) => {
  try {
    const { sessionId } = req.params;
    const history = await chatService.getConversationHistory(sessionId);

    res.json(history);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /chat/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;

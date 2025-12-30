import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Maximum message length to prevent abuse
const MAX_MESSAGE_LENGTH = 2000;

// Chat message validation schema
export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`)
    .trim(),
  sessionId: z.string().uuid().optional(),
});

/**
 * Middleware to validate chat message requests
 */
export function validateChatMessage(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate request body
    const validated = chatMessageSchema.parse(req.body);

    // Replace request body with validated data
    req.body = validated;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    next(error);
  }
}

/**
 * Middleware to validate session ID parameter
 */
export function validateSessionId(req: Request, res: Response, next: NextFunction) {
  const { sessionId } = req.params;

  try {
    z.string().uuid().parse(sessionId);
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Invalid session ID format',
    });
  }
}

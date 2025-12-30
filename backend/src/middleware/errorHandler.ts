import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Don't leak internal error details to client
  const isProduction = process.env.NODE_ENV === 'production';

  // Default error response
  let statusCode = 500;
  let message = 'An unexpected error occurred. Please try again later.';

  // Handle specific error types
  if (error.message.includes('Invalid session ID')) {
    statusCode = 404;
    message = 'Session not found. Please start a new conversation.';
  } else if (error.message.includes('Conversation not found')) {
    statusCode = 404;
    message = 'Conversation not found.';
  } else if (error.message.includes('OpenAI') || error.message.includes('API key')) {
    statusCode = 503;
    message = 'AI service is temporarily unavailable. Please try again later.';
  } else if (error.message.includes('Rate limit')) {
    statusCode = 429;
    message = 'Too many requests. Please try again in a moment.';
  } else if (error.message.includes('timeout')) {
    statusCode = 504;
    message = 'Request timed out. Please try again.';
  }

  res.status(statusCode).json({
    error: message,
    ...(isProduction ? {} : { details: error.message, stack: error.stack }),
  });
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [ 'http://localhost:5173' ,'https://spurbot.samosa.wtf',],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/chat', chatRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Spur Bot API',
    version: '1.0.0',
    status: 'running',
  });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Spur Bot API Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}

  API Endpoints:
  - POST   /chat/message
  - GET    /chat/history/:sessionId
  - GET    /chat/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

# Spur Bot - AI Customer Support Chat

AI-powered customer support chat application built for Spur's take-home assignment.

## Tech Stack

**Backend:** Node.js, TypeScript, Express, PostgreSQL, OpenAI API
**Frontend:** SvelteKit, TypeScript

## Features

- Real-time AI chat responses with OpenAI GPT-3.5-turbo
- Persistent conversation history
- Rate limiting (10 messages/min, 50 messages/hour)
- Interactive quick question buttons
- Dark theme UI with modern design
- Mobile responsive

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- OpenAI API key

### Installation

1. **Backend Setup**
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and OpenAI credentials

# Run migrations
npm run db:migrate

# Start server
npm run dev
```

2. **Frontend Setup**
```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env with backend URL

# Start dev server
npm run dev
```

3. **Access the app**
Open `http://localhost:5173`

## Environment Variables

**Backend (.env)**
```
PORT=3000
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_jwt_secret
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3000
```

## API Endpoints

- `POST /chat/message` - Send message and get AI response
- `GET /chat/history/:sessionId` - Get conversation history
- `GET /chat/health` - Health check

## License

MIT

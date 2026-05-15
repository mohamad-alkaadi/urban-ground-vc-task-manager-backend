# Urban Ground VC Task Manager Backend

A real-time AI-powered task management backend built with Node.js, TypeScript, and Express. This service uses Google's Gemini AI to interpret natural language user inputs and manage tasks stored in Supabase, supporting both HTTP API and WebSocket connections for seamless integration with voice-to-text interfaces.

## Features

- **AI-Powered Task Management**: Leverage Google's Gemini AI to create, update, delete, and retrieve tasks through natural language processing.
- **Real-Time Communication**: WebSocket support via Socket.io for instant responses, ideal for voice-to-text applications.
- **RESTful API**: HTTP endpoints for traditional API interactions.
- **Supabase Integration**: Serverless database for task storage with real-time capabilities.
- **Berlin Time Context**: All time-related operations are handled in Berlin timezone.
- **Comprehensive Logging**: Pino-based logging for debugging and monitoring.
- **TypeScript**: Full type safety and modern development experience.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Real-Time**: Socket.io
- **AI**: Google Generative AI (Gemini)
- **Database**: Supabase
- **Logging**: Pino
- **Testing**: Vitest
- **Development**: ts-node, nodemon-like setup

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project
- Google AI API key

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/mohamad-alkaadi/urban-ground-vc-task-manager-backend.git
   cd urban-ground-vc-task-manager-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_ai_api_key
   ```

4. Set up your Supabase database with a `tasks` table:
   ```sql
   CREATE TABLE tasks (
     id SERIAL PRIMARY KEY,
     title TEXT NOT NULL,
     due_date TIMESTAMP,
     status TEXT DEFAULT 'pending'
   );
   ```

## Usage

### Development

Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in your `.env`).

### Production

Build and start the production server:

```bash
npm run build
npm start
```

### Testing

Run tests:

```bash
npm test
```

Run tests once:

```bash
npm run test:run
```

## API Documentation

### HTTP Endpoints

#### POST /api/chat

Process a user message and return AI response with current tasks.

**Request Body:**

```json
{
  "message": "Create a task to buy groceries",
  "history": [] // Optional: Array of previous chat messages
}
```

**Response:**

```json
{
  "text": "I've created a task for you: 'Buy groceries'",
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "due_date": null,
      "status": "pending"
    }
  ],
  "updatedHistory": [...] // Updated chat history
}
```

### WebSocket Events

Connect to the WebSocket server at the same port as the HTTP server.

#### Events

- **user-message**: Send user input

  ```json
  {
    "message": "Show me all my tasks",
    "history": []
  }
  ```

- **ai-response**: Receive AI response

  ```json
  {
    "text": "Here are your current tasks:",
    "tasks": [...],
    "updatedHistory": [...]
  }
  ```

- **error**: Error handling
  ```json
  {
    "message": "Something went wrong processing your voice."
  }
  ```

## Project Structure

```
src/
├── index.ts              # Main application entry point
├── agents/
│   └── taskAgent.ts      # Task CRUD operations
├── services/
│   ├── gemini.ts         # Google AI integration
│   ├── orchestrator.ts   # Main AI processing logic
│   └── supabase.ts       # Database client
└── utils/
    ├── timeUtils.ts      # Berlin timezone utilities
    └── toolUtils.ts      # AI tool handling
```

## Environment Variables

| Variable            | Description                 | Required |
| ------------------- | --------------------------- | -------- |
| `PORT`              | Server port (default: 5000) | No       |
| `SUPABASE_URL`      | Your Supabase project URL   | Yes      |
| `SUPABASE_ANON_KEY` | Supabase anonymous key      | Yes      |
| `GEMINI_API_KEY`    | Google AI API key           | Yes      |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Issues

Report bugs and request features at: [GitHub Issues](https://github.com/mohamad-alkaadi/urban-ground-vc-task-manager-backend/issues)

## Homepage

[GitHub Repository](https://github.com/mohamad-alkaadi/urban-ground-vc-task-manager-backend)

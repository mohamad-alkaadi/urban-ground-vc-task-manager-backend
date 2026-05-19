import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as dotenv from "dotenv";
import { processUserIntent } from "./services/orchestrator";
import { Content } from "@google/generative-ai";

dotenv.config();

// Initialize the Express app and HTTP server, and set up Socket.IO for real-time communication with clients, allowing us to handle both HTTP requests and WebSocket connections.
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Define an HTTP POST route at /api/chat that receives user messages and chat history, processes the user's intent using the Gemini model, and returns the AI's response along with the current tasks and updated chat history. This allows clients to interact with the AI via standard HTTP requests.
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const result = await processUserIntent(message, history);
    res.json(result);
  } catch (error: any) {
    console.log("❌ HTTP Route Error", { error: error.message });
    res.status(500).json({ error: "The AI brain is feeling a bit foggy." });
  }
});

/*
    Set up Socket.IO to listen for new client connections, 
    handle incoming user messages sent via WebSocket, 
    process those messages using the Gemini model, 
    and emit the AI's response back to the client. 
    This enables real-time interactions with the AI, 
    which is especially useful for voice-to-text scenarios where users expect immediate feedback.
*/
io.on("connection", (socket) => {
  console.log("🔌 New client connected via WebSocket", {
    socketId: socket.id,
  });

  socket.on(
    "user-message",
    async (data: { message: string; history: Content[] }) => {
      console.log("🎙️ Received voice-to-text message", {
        socketId: socket.id,
      });

      try {
        const result = await processUserIntent(data.message, data.history);
        socket.emit("ai-response", {
          text: result.text,
          tasks: result.tasks,
          updatedHistory: result.updatedHistory,
          error: result.error || null,
        });
        console.log("📤 Sent AI response back to client", {
          socketId: socket.id,
          hasError: result.error,
        });
      } catch (error: any) {
        // If there is an error during the processing of the user's message, we log the error and emit an error message back to the client.
        console.log("❌ WebSocket Processing Error", { error: error.message });
        socket.emit("ai-response", {
          text: "An unexpected system exception occurred. Please try again.",
          tasks: [],
          updatedHistory: data.history || [],
          error: true, // Fallback safety flag
        });
      }
    },
  );

  // Listen for the disconnect event to log when a client disconnects from the WebSocket.
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected", { socketId: socket.id });
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`✨ Ready to manage tasks in Berlin!`);
});

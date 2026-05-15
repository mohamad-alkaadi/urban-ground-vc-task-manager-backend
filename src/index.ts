import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as dotenv from "dotenv";
import { processUserIntent } from "./services/orchestrator";
import { Content } from "@google/generative-ai";

dotenv.config();

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
        });
        console.log("📤 Sent AI response back to client", {
          socketId: socket.id,
        });
      } catch (error: any) {
        console.log("❌ WebSocket Processing Error", { error: error.message });
        socket.emit("error", {
          message: "Something went wrong processing your voice.",
        });
      }
    },
  );
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected", { socketId: socket.id });
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`✨ Ready to manage tasks in Berlin!`);
});

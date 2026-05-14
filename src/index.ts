import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as dotenv from "dotenv";
import pinoHttp from "pino-http";
// import { logger } from "./services/logger";
import { processUserIntent } from "./services/orchestrator";

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
// app.use(pinoHttp({ logger }));

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
    // logger.error({ error: error.message }, "❌ HTTP Route Error");
    res.status(500).json({ error: "The AI brain is feeling a bit foggy." });
  }
});

io.on("connection", (socket) => {
  // logger.info({ socketId: socket.id }, "🔌 New client connected via WebSocket");
  socket.on(
    "user-message",
    async (data: { message: string; history: any[] }) => {
      // logger.info({ socketId: socket.id }, "🎙️ Received voice-to-text message");

      try {
        const result = await processUserIntent(data.message, data.history);
        socket.emit("ai-response", {
          text: result.text,
          tasks: result.tasks,
          updatedHistory: result.updatedHistory,
          // isSilent: result.isSilent || false,
        });
        // logger.info(
        //   { socketId: socket.id },
        //   "📤 Sent AI response back to client",
        // );
      } catch (error: any) {
        // logger.error({ error: error.message }, "❌ WebSocket Processing Error");
        socket.emit("error", {
          message: "Something went wrong processing your voice.",
        });
      }
    },
  );
  socket.on("disconnect", () => {
    // logger.info({ socketId: socket.id }, "🔌 Client disconnected");
  });
});

httpServer.listen(PORT, () => {
  // logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  // logger.info(`✨ Ready to manage tasks in Berlin!`);
});

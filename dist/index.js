"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const pino_http_1 = __importDefault(require("pino-http"));
const logger_1 = require("./services/logger");
const orchestrator_1 = require("./services/orchestrator");
dotenv.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, pino_http_1.default)({ logger: logger_1.logger }));
const PORT = process.env.PORT || 5000;
app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }
    try {
        const result = await (0, orchestrator_1.processUserIntent)(message, history);
        res.json(result);
    }
    catch (error) {
        logger_1.logger.error({ error: error.message }, "❌ HTTP Route Error");
        res.status(500).json({ error: "The AI brain is feeling a bit foggy." });
    }
});
io.on("connection", (socket) => {
    logger_1.logger.info({ socketId: socket.id }, "🔌 New client connected via WebSocket");
    socket.on("user-message", async (data) => {
        logger_1.logger.info({ socketId: socket.id }, "🎙️ Received voice-to-text message");
        try {
            const result = await (0, orchestrator_1.processUserIntent)(data.message, data.history);
            socket.emit("ai-response", {
                text: result.text,
                tasks: result.tasks,
                updatedHistory: result.updatedHistory,
                // isSilent: result.isSilent || false,
            });
            logger_1.logger.info({ socketId: socket.id }, "📤 Sent AI response back to client");
        }
        catch (error) {
            logger_1.logger.error({ error: error.message }, "❌ WebSocket Processing Error");
            socket.emit("error", {
                message: "Something went wrong processing your voice.",
            });
        }
    });
    socket.on("disconnect", () => {
        logger_1.logger.info({ socketId: socket.id }, "🔌 Client disconnected");
    });
});
httpServer.listen(PORT, () => {
    logger_1.logger.info(`🚀 Server is running on http://localhost:${PORT}`);
    logger_1.logger.info(`✨ Ready to manage tasks in Berlin!`);
});
//# sourceMappingURL=index.js.map
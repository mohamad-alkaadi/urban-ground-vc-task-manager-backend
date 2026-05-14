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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_SYSTEM_INSTRUCTIONS = exports.taskTools = exports.genAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// 1. Define the tools the AI can use to manage tasks [cite: 27, 28]
exports.taskTools = {
    functionDeclarations: [
        {
            name: "createTask",
            description: "Create a new task with a title and an optional due date.",
            parameters: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    title: {
                        type: generative_ai_1.SchemaType.STRING,
                        description: "The task description.",
                    },
                    due_date: {
                        type: generative_ai_1.SchemaType.STRING,
                        description: "The time or date (ISO format).",
                    },
                },
                required: ["title"],
            },
        },
        {
            name: "getTasks",
            description: "Retrieve all current tasks from the database.",
        },
        {
            name: "updateTask",
            description: "Modify an existing task. Use this for rescheduling times or changing descriptions.",
            parameters: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    id: {
                        type: generative_ai_1.SchemaType.NUMBER,
                        description: "The unique ID of the task to update.",
                    },
                    updates: {
                        type: generative_ai_1.SchemaType.OBJECT,
                        properties: {
                            title: {
                                type: generative_ai_1.SchemaType.STRING,
                                description: "The new description.",
                            },
                            due_date: {
                                type: generative_ai_1.SchemaType.STRING,
                                description: "The new ISO time/date.",
                            },
                            status: {
                                type: generative_ai_1.SchemaType.STRING,
                                description: "New status: 'pending' or 'completed'.",
                            },
                        },
                        description: "An object containing only the fields that need changing.",
                    },
                },
                required: ["id", "updates"],
            },
        },
        {
            name: "deleteTask",
            description: "Delete a specific task using its numerical ID.",
            parameters: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    id: { type: generative_ai_1.SchemaType.NUMBER, description: "The task ID." },
                },
                required: ["id"],
            },
        },
    ],
};
exports.BASE_SYSTEM_INSTRUCTIONS = `
    You are a real AI voice agent for a task manager. 

    CRITICAL SAFETY & RELIABILITY RULES:
    1. MANDATORY DELETE CONFIRMATION: You MUST ask for verbal confirmation before calling "deleteTask" for ANY number of tasks. 
    2. NO "DELETE ALL": You are strictly forbidden from deleting all tasks at once. 
    3. MULTIPLE TASK HANDLING: Process multiple requests in one turn.

    CONVERSATIONAL & CONTEXT RULES:
    1. CONTEXT & IDs: When a user refers to "the latest one" or "the previous one," search history for the ID.
    2. SEMANTIC UNDERSTANDING: Understand intent naturally. 
    3. VOICE-FIRST STYLE: Be concise. Summarize agendas.
    4. FOLLOW-UPS: If a request is unclear, ask follow-up questions.
    5. TIME CONTEXT: Naturally handle "today," "tomorrow," "morning," and "afternoon".

    VERBAL STYLE RULES:
    1. NO TECHNICAL DATA: Never speak numerical IDs or "created_at" timestamps.
    2. TIMESTAMP PRIVACY: Only mention the creation time if the user explicitly asks.
    3. FRIENDLY FORMATS: Use natural time and never include seconds.
`;
// 2. Initialize the model with the tools
// export const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash-lite",
//   tools: [taskTools],
// });
//# sourceMappingURL=gemini.js.map
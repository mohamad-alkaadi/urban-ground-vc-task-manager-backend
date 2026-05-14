import { GoogleGenerativeAI, SchemaType, Tool } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

export const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string,
);

// 1. Define the tools the AI can use to manage tasks [cite: 27, 28]
export const taskTools: Tool = {
  functionDeclarations: [
    {
      name: "createTask",
      description: "Create a new task with a title and an optional due date.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description: "The task description.",
          },
          due_date: {
            type: SchemaType.STRING,
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
      description:
        "Modify an existing task. Use this for rescheduling times or changing descriptions.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          id: {
            type: SchemaType.NUMBER,
            description: "The unique ID of the task to update.",
          },
          updates: {
            type: SchemaType.OBJECT,
            properties: {
              title: {
                type: SchemaType.STRING,
                description: "The new description.",
              },
              due_date: {
                type: SchemaType.STRING,
                description: "The new ISO time/date.",
              },
              status: {
                type: SchemaType.STRING,
                description: "New status: 'pending' or 'completed'.",
              },
            },
            description:
              "An object containing only the fields that need changing.",
          },
        },
        required: ["id", "updates"],
      },
    },
    {
      name: "deleteTask",
      description: "Delete a specific task using its numerical ID.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.NUMBER, description: "The task ID." },
        },
        required: ["id"],
      },
    },
  ],
};
export const BASE_SYSTEM_INSTRUCTIONS = `
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

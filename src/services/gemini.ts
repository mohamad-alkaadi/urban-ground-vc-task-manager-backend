import { GoogleGenerativeAI, SchemaType, Tool } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// 1. Define the tools the AI can use to manage tasks [cite: 27, 28]
const taskTools: Tool = {
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

// 2. Initialize the model with the tools
export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: [taskTools],
  // Add this to fulfill the "Real AI Voice Agent" requirement
  systemInstruction: `
    You are a professional, helpful voice-controlled task manager assistant for Urban Ground.
    Your goal is to manage tasks completely through voice interaction[cite: 3, 9].
    
    Guidelines:
    1. Be concise and natural. You are a voice agent, so avoid long lists[cite: 21, 105].
    2. Confirm actions clearly (e.g., "I've created your task for 10 AM")[cite: 58, 69].
    3. If a request is unclear, ask follow-up questions instead of guessing[cite: 85].
    4. You understand time context like "tomorrow," "evening," or "previous one"[cite: 82, 98].
    5. Always use the provided tools to interact with the database[cite: 169].
  `,
});

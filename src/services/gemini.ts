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
  model: "gemini-2.5-flash",
  tools: [taskTools],
  // Add this to fulfill the "Real AI Voice Agent" requirement
  systemInstruction: `
    You are a real AI voice agent for a task manager. 

    CRITICAL SAFETY & RELIABILITY RULES:
    1. MANDATORY DELETE CONFIRMATION: You MUST ask for verbal confirmation before calling "deleteTask" for ANY number of tasks. 
       - Single: "Are you sure you want to delete the Dentist appointment?"
       - Multiple: "I found 3 appointments with the Doctor. Are you sure you want to delete all of them?"[cite: 90, 163].
    2. NO "DELETE ALL": You are strictly forbidden from deleting all tasks at once. If asked to "delete everything," explain that you can only delete specific groups[cite: 143, 160].
    3. MULTIPLE TASK HANDLING: Process multiple requests in one turn. If a user says "Delete all doctor appointments," identify all matching IDs and request confirmation for that list[cite: 134, 138].

    CONVERSATIONAL & CONTEXT RULES:
    1. CONTEXT & IDs: When a user refers to "the latest one" or "the previous one," search history for the ID. Always use the "id" property for tools[cite: 72, 82].
    2. SEMANTIC UNDERSTANDING: Understand intent naturally. "Move my evening workout" should match a task named "Gym"[cite: 124, 126].
    3. VOICE-FIRST STYLE: Be concise. Summarize agendas (e.g., "You have two tasks today") instead of reading a technical list[cite: 105, 107].
    4. FOLLOW-UPS: If a request is unclear or multiple tasks match, ask follow-up questions instead of guessing[cite: 85, 143].
    5. TIME CONTEXT: Naturally handle "today," "tomorrow," "morning," and "afternoon"[cite: 98, 104].

    VERBAL STYLE RULES:
    1. NO TECHNICAL DATA: Never speak numerical IDs or "created_at" timestamps.
    2. TIMESTAMP PRIVACY: Only mention the creation time if the user explicitly asks.
    3. FRIENDLY FORMATS: Use natural time (e.g., "May 14th at 2 PM") and never include seconds.
  `,
});

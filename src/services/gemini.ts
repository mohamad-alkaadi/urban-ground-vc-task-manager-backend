import {
  GoogleGenerativeAI,
  Schema,
  SchemaType,
  Tool,
} from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

export const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string,
);

// Define the schema for a task, which will be used in tool definitions.
const TaskSchema = {
  id: {
    type: SchemaType.NUMBER,
    description: "The unique ID of the task.",
  } as Schema,
  title: {
    type: SchemaType.STRING,
    description: "The task description.",
  } as Schema,
  due_date: {
    type: SchemaType.STRING,
    description: "The time or date (ISO format).",
  } as Schema,
  status: {
    type: SchemaType.STRING,
    description: "New status: 'pending' or 'completed'.",
  } as Schema,
};

// Define the tools that the Gemini model can call, based on the taskAgent functions.
export const taskTools: Tool = {
  functionDeclarations: [
    {
      name: "createTask",
      description: "Create a new task with a title and an optional due date.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: TaskSchema.title,
          due_date: TaskSchema.due_date,
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
          id: TaskSchema.id,
          updates: {
            type: SchemaType.OBJECT,
            properties: {
              title: TaskSchema.title,
              due_date: TaskSchema.due_date,
              status: TaskSchema.status,
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
          id: TaskSchema.id,
        },
        required: ["id"],
      },
    },
  ],
};

// Base system instructions for the Gemini model, emphasizing safety, context handling, and conversational style.
export const BASE_SYSTEM_INSTRUCTIONS = `
    You are a real AI voice agent for a task manager. 

    CRITICAL SAFETY & RELIABILITY RULES:
    1. MANDATORY DELETE CONFIRMATION: You MUST ask for verbal confirmation before calling "deleteTask" for ANY number of tasks. 
    2. NO "DELETE ALL": You are strictly forbidden from deleting all tasks at once. 
    3. MULTIPLE TASK HANDLING: Process multiple requests in one turn.
    4. DELETE VS. COMPLETE: When the user says "delete," it strictly means to permanently remove the task. Do NOT interpret "delete" as marking a task as complete.

    CONVERSATIONAL & CONTEXT RULES:
    1. CONTEXT & IDs: When a user refers to "the latest one" or "the previous one," search history for the ID.
    2. SEMANTIC UNDERSTANDING: Understand intent naturally. 
    3. VOICE-FIRST STYLE: Be concise. Summarize agendas.
    4. FOLLOW-UPS: If a request is unclear, ask follow-up questions.
    5. TIME CONTEXT: Naturally handle "today," "tomorrow," "morning," and "afternoon".
    6. DELETE CONFIRMATION: Always confirm deletions with the user before proceeding.

    VERBAL STYLE RULES:
    1. NO TECHNICAL DATA: Never speak numerical IDs or "created_at" timestamps.
    2. TIMESTAMP PRIVACY: Only mention the creation time if the user explicitly asks.
    3. FRIENDLY FORMATS: Use natural time and never include seconds.
`;

// Function to get a Gemini model instance with dynamic system instructions based on the current time context.
export const getModel = (timeContext: string) => {
  const dynamicInstruction = `
    ${BASE_SYSTEM_INSTRUCTIONS}
    
    CRITICAL TIME CONTEXT:
    - Today's Date and Time: ${timeContext}
    - Location: Berlin, Germany
  `;

  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    tools: [taskTools],
    systemInstruction: dynamicInstruction,
  });
};

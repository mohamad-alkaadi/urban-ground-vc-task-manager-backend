import { getModel } from "./gemini";
import { taskAgent } from "../agents/taskAgent";
import { handleToolCalls } from "../utils/toolUtils";
import { Content } from "@google/generative-ai";
import { getBerlinTime } from "../utils/timeUtils";

// Main function to process user intent, generate AI responses, and handle tool calls.
export async function processUserIntent(
  userMessage: string,
  history: Content[] = [],
) {
  // Check if the user is requesting to fetch all tasks, which will affect how we format the response.
  const isInitialFetch = userMessage === "get all my tasks";

  // Get the current time in Berlin to provide context for the Gemini model, which can help with time-sensitive responses.
  const now = new Date();
  const berlinTime = getBerlinTime(now);

  // Get a Gemini model instance with the current time context included in the system instructions.
  const model = getModel(berlinTime);

  // Start a new chat session with the provided history, allowing the model to maintain context across interactions.
  const chat = model.startChat({
    history: history,
  });

  // Send the user's message to the Gemini model and await the response, which may include function calls for task management.
  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  const calls = response.functionCalls();

  // If the Gemini model has made any function calls (e.g., to create, update, or fetch tasks), we need to handle those calls and then send the results back to the model for a final response.
  if (calls && calls.length > 0) {
    const toolResponses = await handleToolCalls(calls);
    const finalResult = await chat.sendMessage(toolResponses);

    return {
      text: isInitialFetch ? "" : finalResult.response.text(),
      tasks: await taskAgent.getTasks(),
      updatedHistory: await chat.getHistory(),
    };
  }

  // If there are no function calls, we can simply return the text response from the Gemini model along with the current tasks and updated chat history.
  return {
    text: isInitialFetch ? "" : response.text(),
    tasks: await taskAgent.getTasks(),
    updatedHistory: await chat.getHistory(),
  };
}

import { getModel } from "./gemini";
import { taskAgent } from "../agents/taskAgent";
import { handleToolCalls } from "../utils/toolUtils";
import { Content } from "@google/generative-ai";
import { getBerlinTime } from "../utils/timeUtils";

export async function processUserIntent(
  userMessage: string,
  history: Content[] = [],
) {
  const isInitialFetch = userMessage === "get all my tasks";

  const now = new Date();
  const berlinTime = getBerlinTime(now);

  const model = getModel(berlinTime);

  const chat = model.startChat({
    history: history,
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  const calls = response.functionCalls();

  if (calls && calls.length > 0) {
    const toolResponses = await handleToolCalls(calls);
    const finalResult = await chat.sendMessage(toolResponses);

    return {
      text: isInitialFetch ? "" : finalResult.response.text(),
      tasks: await taskAgent.getTasks(),
      updatedHistory: await chat.getHistory(),
    };
  }

  return {
    text: isInitialFetch ? "" : response.text(),
    tasks: await taskAgent.getTasks(),
    updatedHistory: await chat.getHistory(),
  };
}

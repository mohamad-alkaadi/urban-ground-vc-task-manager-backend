import { model } from "./gemini";
import { taskAgent } from "../agents/taskAgent";
import { logger } from "./logger";

export async function processUserIntent(
  userMessage: string,
  history: any[] = [],
) {
  const isInitialFetch = userMessage === "get all my tasks";
  logger.info({ userMessage }, "🧠 Processing new user message");
  const chat = model.startChat({
    history: history,
  });

  let result = await chat.sendMessage(userMessage);
  let response = result.response;

  const call = response.functionCalls()?.[0] as
    | { name: string; args: Record<string, any> }
    | undefined;

  if (call) {
    const { name, args } = call;
    logger.info(
      { tool: name, arguments: args },
      "🤖 AI Decision: Calling tool",
    );

    let toolResult;

    try {
      switch (name) {
        case "createTask":
          toolResult = await taskAgent.createTask(
            args.title as string,
            args.due_date as string,
          );
          break;
        case "getTasks":
          toolResult = await taskAgent.getTasks();
          break;
        case "updateTask":
          toolResult = await taskAgent.updateTask(
            args.id as number,
            args.updates as any,
          );
          break;
        case "deleteTask":
          toolResult = await taskAgent.deleteTask(args.id as number);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
      logger.info(
        { tool: name, status: "success" },
        "✅ Tool execution complete",
      );
      const finalResult = await chat.sendMessage([
        {
          functionResponse: {
            name,
            response: { content: toolResult },
          },
        },
      ]);
      const allTasks = await taskAgent.getTasks();
      let aiResponseText = finalResult.response.text();
      if (name === "getTasks" && isInitialFetch) {
        aiResponseText = ""; // Return empty text so TTS stays quiet
      }
      return {
        text: aiResponseText,
        tasks: allTasks,
        updatedHistory: await chat.getHistory(),
        // isSilent: true,
      };
    } catch (error: any) {
      logger.error(
        { tool: name, error: error.message },
        "❌ Tool execution failed",
      );
      const errorResult = await chat.sendMessage([
        {
          functionResponse: {
            name,
            response: { error: error.message },
          },
        },
      ]);
      const currentTasks = await taskAgent.getTasks();
      return {
        text: errorResult.response.text(),
        tasks: currentTasks,
        updatedHistory: await chat.getHistory(),
      };
    }
  }
  const finalTasks = await taskAgent.getTasks();
  return {
    text: isInitialFetch ? "" : response.text(),
    tasks: finalTasks,
    updatedHistory: await chat.getHistory(),
    // isSilent: true,
  };
}

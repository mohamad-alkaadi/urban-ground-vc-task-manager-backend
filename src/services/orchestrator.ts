import { BASE_SYSTEM_INSTRUCTIONS, genAI, taskTools } from "./gemini";
import { taskAgent } from "../agents/taskAgent";
import { logger } from "./logger";

export async function processUserIntent(
  userMessage: string,
  history: any[] = [],
) {
  const isInitialFetch = userMessage === "get all my tasks";

  const now = new Date();
  const berlinTime = now.toLocaleString("en-DE", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 2. Inject it into this specific chat session
  const dynamicInstruction = `
    ${BASE_SYSTEM_INSTRUCTIONS}
    
    CRITICAL TIME CONTEXT:
    - Today's Date and Time: ${berlinTime}
    - Location: Berlin, Germany
  `;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    tools: [taskTools],
    systemInstruction: dynamicInstruction, // 👈 It is locked in perfectly now
  });
  // 3. Inject the merged instructions
  const chat = model.startChat({
    history: history,
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  const calls = response.functionCalls();

  if (calls && calls.length > 0) {
    logger.info(
      { count: calls.length },
      "🤖 AI Intent: Multiple actions detected",
    );

    const toolResponses = [];

    // 1. PROCESS ALL CALLS FIRST (No 'return' inside this loop!)
    for (const call of calls) {
      const { name, args } = call;
      const typedArgs = args as any;
      let toolResult;

      try {
        switch (name) {
          case "createTask":
            toolResult = await taskAgent.createTask(
              typedArgs.title,
              typedArgs.due_date,
            );
            break;
          case "updateTask":
            toolResult = await taskAgent.updateTask(
              typedArgs.id,
              typedArgs.updates,
            );
            break;
          case "deleteTask":
            toolResult = await taskAgent.deleteTask(typedArgs.id);
            break;
          case "getTasks":
            toolResult = await taskAgent.getTasks();
            break;
        }

        toolResponses.push({
          functionResponse: { name, response: { content: toolResult } },
        });
      } catch (error: any) {
        toolResponses.push({
          functionResponse: { name, response: { error: error.message } },
        });
      }
    }

    // 2. SEND ALL RESULTS TO GEMINI AT ONCE
    // This allows Gemini to summarize everything in one natural sentence.
    const finalResult = await chat.sendMessage(toolResponses);
    const allTasks = await taskAgent.getTasks();

    return {
      text: isInitialFetch ? "" : finalResult.response.text(),
      tasks: allTasks,
      updatedHistory: await chat.getHistory(),
    };
  }

  // 3. DEFAULT CASE (If no tools were called)
  const finalTasks = await taskAgent.getTasks();
  return {
    text: isInitialFetch ? "" : response.text(),
    tasks: finalTasks,
    updatedHistory: await chat.getHistory(),
  };
}

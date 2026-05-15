import { FunctionCall } from "@google/generative-ai";
import { taskAgent } from "../agents/taskAgent";

interface Arguments {
  title?: string;
  due_date?: string;
  id?: number;
  updates?: object;
}
export const handleToolCalls = async (calls: FunctionCall[]) => {
  console.log("🤖 AI Intent: Multiple actions detected", {
    count: calls.length,
  });
  const toolResponses = [];

  for (const call of calls) {
    const { name, args } = call;
    const typedArgs = args as Arguments;
    let toolResult;

    try {
      switch (name) {
        case "createTask":
          toolResult = await taskAgent.createTask(
            typedArgs.title as string,
            typedArgs.due_date as string,
          );
          break;
        case "updateTask":
          toolResult = await taskAgent.updateTask(
            typedArgs.id as number,
            typedArgs.updates as object,
          );
          break;
        case "deleteTask":
          toolResult = await taskAgent.deleteTask(typedArgs.id as number);
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
  return toolResponses;
};

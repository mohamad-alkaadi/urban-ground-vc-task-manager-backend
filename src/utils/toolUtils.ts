import { FunctionCall } from "@google/generative-ai";
import { taskAgent } from "../agents/taskAgent";

// Define the structure of arguments that the Gemini model will pass when it makes function calls to our tools.
interface Arguments {
  title?: string;
  due_date?: string;
  id?: number;
  updates?: object;
}

// This function takes an array of function calls from the Gemini model, executes the corresponding taskAgent functions based on the call name, and collects the results to send back to the model for further processing.
export const handleToolCalls = async (calls: FunctionCall[]) => {
  console.log("🤖 AI Intent: Multiple actions detected", {
    count: calls.length,
  });

  const toolResponses = [];

  // Loop through each function call made by the Gemini model, determine which taskAgent function to execute based on the call name, and handle any errors that may occur during execution.
  for (const call of calls) {
    const { name, args } = call;
    const typedArgs = args as Arguments;
    let toolResult;

    try {
      // Based on the function call name, execute the corresponding taskAgent function with the provided arguments and store the result to send back to the Gemini model.
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
        // If the function call executes successfully, we push the result into the toolResponses array to be sent back to the Gemini model for further processing in the chat flow.
        functionResponse: { name, response: { content: toolResult } },
      });
    } catch (error: any) {
      // If there is an error during the execution of any function call, we catch the error and push an error response back to the Gemini model, which can then be used to inform the user about what went wrong.
      toolResponses.push({
        functionResponse: { name, response: { error: error.message } },
      });
    }
  }
  return toolResponses;
};

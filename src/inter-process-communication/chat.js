/**
 * IPC handler for chat requests.
 * Receives a message and model from the renderer, sends them to the AI API,
 * and returns the AI reply.
 *
 * @param {string} message - The user message to send to the AI.
 * @param {string} model - The model ID to use for the request.
 * @returns {Promise<{ok: boolean, reply?: string, error?: string}>}
 */
const { chat } = require("../ai-bridge");
const { toolDefinitions, toolFunctions } = require("../tools");

let history = [];

function clearHistory() {
  history = [];
}

module.exports = {
  name: "chat",
  handler: async (event, { message, model, folderPath }) => {
    try {
      if (history.length === 0) {
        history.push({
          role: "system",
          content: `You are a documentation assistant. You help users find and read documentation. The user's working directory is: ${folderPath || "not set"}. Use this as basePath when calling fileSearch or fileGrep.`,
        });
      }

      history.push({ role: "user", content: message });

      // reply is the object returned by chat():
      // {
      //   content: "Here is what the file says...",  // AI's text (null if tool_calls only)
      //   toolCalls: [                               // empty array if no tool calls
      //     {
      //       id: "call_abc123",
      //       type: "function",
      //       function: {
      //         name: "readFile",
      //         arguments: "{\"filePath\": \"/home/user/doc.txt\"}"
      //       }
      //     }
      //   ],
      //   usage: { total_tokens: 50 }
      // }
      let reply = await chat(history, model, { tools: toolDefinitions });

      while (reply.toolCalls && reply.toolCalls.length > 0) {
        history.push({
          role: "assistant",
          content: reply.content || "",
          tool_calls: reply.toolCalls,
        });

        // Execute each tool call
        for (const toolCall of reply.toolCalls) {
          const fn = toolFunctions[toolCall.function.name];
          let result;
          if (fn) {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              result = fn(args);
            } catch (err) {
              result = `Error: ${err.message}`;
            }
          } else {
            result = `Error: Unknown tool "${toolCall.function.name}"`;
          }

          // Add tool result to history
          history.push({
            role: "tool",
            content: result,
            tool_call_id: toolCall.id,
          });
        }

        // Send tool results back to AI
        reply = await chat(history, model, { tools: toolDefinitions });
      }

      history.push({ role: "assistant", content: reply.content });

      return { ok: true, reply: reply.content, usage: reply.usage };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },
  clearHistory,
};

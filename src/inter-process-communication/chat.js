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
    const startTime = Date.now();
    let totalTokens = 0;

    const sendThinking = (text) => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const tokens = totalTokens;
      if (event.sender && event.sender.send) {
        event.sender.send("chat:thinking", { text, elapsed, tokens });
      }
    };

    const sendToolCall = (tool, args, status) => {
      if (event.sender && event.sender.send) {
        event.sender.send("chat:tool", { tool, args, status });
      }
    };

    try {
      if (history.length === 0) {
        history.push({
          role: "system",
          content: `You are a documentation assistant. You help users find and read documentation. The user's working directory is: ${folderPath || "not set"}. Use this as basePath when calling fileSearch or fileGrep.`,
        });
      }

      history.push({ role: "user", content: message });

      sendThinking("Thinking");

      let reply = await chat(history, model, { tools: toolDefinitions });
      if (reply.usage) totalTokens += reply.usage.total_tokens || 0;

      while (reply.toolCalls && reply.toolCalls.length > 0) {
        if (reply.content) {
          sendThinking(reply.content);
        }

        history.push({
          role: "assistant",
          content: reply.content || "",
          tool_calls: reply.toolCalls,
        });

        // Execute each tool call
        for (const toolCall of reply.toolCalls) {
          const toolName = toolCall.function.name;
          let args = {};
          try { args = JSON.parse(toolCall.function.arguments); } catch {}

          sendToolCall(toolName, args, "running");

          const fn = toolFunctions[toolName];
          let result;
          if (fn) {
            try {
              result = fn(args);
              sendToolCall(toolName, args, "done");
            } catch (err) {
              result = `Error: ${err.message}`;
              sendToolCall(toolName, args, "error");
            }
          } else {
            result = `Error: Unknown tool "${toolName}"`;
            sendToolCall(toolName, args, "error");
          }

          // Add tool result to history
          history.push({
            role: "tool",
            content: result,
            tool_call_id: toolCall.id,
          });
        }

        // Send tool results back to AI
        sendThinking("Thinking");
        reply = await chat(history, model, { tools: toolDefinitions });
        if (reply.usage) totalTokens += reply.usage.total_tokens || 0;
      }

      history.push({ role: "assistant", content: reply.content });

      return { ok: true, reply: reply.content, usage: reply.usage };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },
  clearHistory,
};

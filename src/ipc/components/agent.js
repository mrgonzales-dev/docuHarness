/**
 * IPC handler for agent chat requests.
 * Receives a message and model from the renderer, sends them to the AI API,
 * and returns the AI reply.
 *
 * AgentSession encapsulates conversation history and abort controller
 * as instance state, enabling multiple independent agent sessions.
 *
 * @param {string} message - The user message to send to the AI.
 * @param {string} model - The model ID to use for the request.
 * @returns {Promise<{ok: boolean, reply?: string, error?: string}>}
 */
const { chat } = require("@/ai-bridge");
const { toolDefinitions, toolFunctions } = require("@/tools");
const thinkingTexts = require("@/thinking-texts");

function randomThinkingText() {
  return thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)];
}

class AgentSession {
  constructor() {
    this.history = [];
    this.currentAbortController = null;
  }

  clearHistory() {
    this.history = [];
  }

  interrupt() {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
  }

  async handle(event, { message, model, folderPath }) {
    // Setup: timing, token tracking, abort controller
    const startTime = Date.now();
    let totalTokens = 0;

    this.currentAbortController = new AbortController();
    const signal = this.currentAbortController.signal;

    // Renderer communication helpers
    const sendThinking = (text) => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const tokens = totalTokens;
      if (event.sender && event.sender.send) {
        event.sender.send("agent:thinking", { text, elapsed, tokens });
      }
    };

    const sendToolCall = (tool, args, status, callId) => {
      if (event.sender && event.sender.send) {
        event.sender.send("agent:tool", { tool, args, status, callId });
      }
    };

    try {
      // System prompt: built once on first message
      if (this.history.length === 0) {
        const systemPrompt = JSON.stringify({
          role: "You are an agentic coding assistant. You help engineers plan and build software.",
          system_setup: {
            working_directory: folderPath || "not set",
            instructions: folderPath
              ? "Use the working directory as basePath when calling fileSearch or fileGrep."
              : "No working directory is set. Do not call any tools that need a path. Ask the user to select a folder first.",
          },
          tools: toolDefinitions.map((t) => ({
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
          })),
        });

        this.history.push({
          role: "system",
          content: systemPrompt,
        });
      }

      // Add user message to history
      this.history.push({ role: "user", content: message });

      // Streaming progress callback
      let currentThinkingText = randomThinkingText();

      const onProgress = (progress) => {
        if (progress.usage) {
          totalTokens = progress.usage.total_tokens || totalTokens;
        }
        sendThinking(currentThinkingText);
      };

      sendThinking(currentThinkingText);

      // First AI call
      let reply = await chat(
        this.history,
        model,
        { tools: toolDefinitions },
        onProgress,
        signal,
      );

      // Tool-call loop: execute tools, feed results back to AI
      while (reply.toolCalls && reply.toolCalls.length > 0) {
        this.history.push({
          role: "assistant",
          content: reply.content || "",
          tool_calls: reply.toolCalls,
        });

        // Execute each tool call
        for (const toolCall of reply.toolCalls) {
          const toolName = toolCall.function.name;
          let args = {};
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch {}

          const callId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          sendToolCall(toolName, args, "running", callId);

          const fn = toolFunctions[toolName];
          let result;
          if (fn) {
            try {
              result = fn(args);
              sendToolCall(toolName, args, "done", callId);
            } catch (err) {
              result = `Error: ${err.message}`;
              sendToolCall(toolName, args, "error", callId);
            }
          } else {
            result = `Error: Unknown tool "${toolName}"`;
            sendToolCall(toolName, args, "error", callId);
          }

          // Add tool result to history
          this.history.push({
            role: "tool",
            content: result,
            tool_call_id: toolCall.id,
          });
        }

        // Send tool results back to AI
        currentThinkingText = randomThinkingText();
        sendThinking(currentThinkingText);
        reply = await chat(
          this.history,
          model,
          { tools: toolDefinitions },
          onProgress,
          signal,
        );
      }

      // Finalize: store assistant reply and return
      this.history.push({ role: "assistant", content: reply.content });

      return { ok: true, reply: reply.content, usage: reply.usage };

      // Error handling: abort vs generic failure
    } catch (err) {
      if (err.message === "Aborted") {
        return { ok: false, error: "Interrupted" };
      }
      return { ok: false, error: err.message };
    } finally {
      this.currentAbortController = null;
    }
  }
}

// Default singleton for backward compatibility with the IPC registry
const defaultSession = new AgentSession();

module.exports = {
  AgentSession,
  name: "agent",
  handler: (event, args) => defaultSession.handle(event, args),
  interrupt: () => defaultSession.interrupt(),
  clearHistory: () => defaultSession.clearHistory(),
};

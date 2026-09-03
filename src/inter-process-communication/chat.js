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

let history = [];

function clearHistory() {
  history = [];
}

module.exports = {
  name: "chat",
  handler: async (event, { message, model }) => {
    try {
      // Start with system prompt on first call
      if (history.length === 0) {
        history.push({
          role: "system",
          content:
            "You are a documentation assistant. You help users find and read documentation.",
        });
      }

      // Add user message to history
      history.push({ role: "user", content: message });

      // Send full history to AI
      const reply = await chat(history, model);

      // Add AI reply to history
      history.push({ role: "assistant", content: reply.content });

      return { ok: true, reply: reply.content, usage: reply.usage };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },
  clearHistory,
};

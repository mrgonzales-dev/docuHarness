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

module.exports = {
  name: "chat",
  handler: async (event, { message, model }) => {
    try {
      const messages = [
        {
          role: "system",
          content:
            "You are a documentation assistant. You help users find and read documentation.",
        },
        { role: "user", content: message },
      ];

      const reply = await chat(messages, model);
      return { ok: true, reply };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },
};

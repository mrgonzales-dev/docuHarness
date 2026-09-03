const axios = require("axios");
const { loadConfig } = require("../config.js");

async function chat(messages, model, options = {}) {
  const { host, apiKey } = loadConfig();

  const body = {
    model,
    messages,
  };

  if (options.tools) {
    body.tools = options.tools;
  }

  const res = await axios.post(`${host}/chat/completions`, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const message = res.data.choices[0].message;

  return {
    content: message.content,
    toolCalls: message.tool_calls || [],
    usage: res.data.usage,
  };
}

module.exports = { chat };

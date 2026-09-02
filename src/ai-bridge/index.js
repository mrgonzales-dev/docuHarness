const axios = require("axios");
const { loadConfig } = require("../config.js");

async function chat(messages, model) {
  const { host, apiKey } = loadConfig();

  const res = await axios.post(
    `${host}/chat/completions`,
    {
      model,
      messages,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  return {
    content: res.data.choices[0].message.content,
    usage: res.data.usage,
  };
}

module.exports = { chat };

const axios = require("axios");
const { loadConfig } = require("./config");

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
    }
  );

  return res.data.choices[0].message.content;
}

module.exports = { chat };
